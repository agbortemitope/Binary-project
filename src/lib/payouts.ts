import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createPayoutTransfer, getPayoutWalletBalance, makeTransactionReference } from "@/lib/interswitch";
import { env, hasInterswitchPayoutConfig } from "@/lib/env";
import { getTeamMembersWithPayouts, requireTeamAdminRole } from "@/lib/team-management";

type DirectTeamPayoutStatus = "processing" | "successful" | "failed" | "skipped";

function inferPayoutStatus(payload: Record<string, unknown>) {
  const raw = String(
    payload["status"] ??
      payload["paymentStatus"] ??
      (payload["response"] as Record<string, unknown> | undefined)?.["status"] ??
      "",
  ).toUpperCase();

  if (raw.includes("SUCCESS")) return "successful";
  if (raw.includes("FAIL")) return "failed";
  return "processing";
}

export async function attemptPayoutForEarning({
  earningId,
  initiatedByUserId,
}: {
  earningId: string;
  initiatedByUserId: string;
}) {
  const admin = createSupabaseAdminClient();
  const { data: earning, error: earningError } = await admin
    .from("worker_earnings")
    .select("*")
    .eq("id", earningId)
    .single();

  if (earningError || !earning) {
    throw new Error(earningError?.message ?? "Worker earning not found.");
  }

  const { data: payoutMethod, error: payoutMethodError } = await admin
    .from("payout_methods")
    .select("*")
    .eq("user_id", earning.worker_user_id)
    .maybeSingle();

  if (payoutMethodError || !payoutMethod) {
    throw new Error("Worker payout method is missing.");
  }

  if (!payoutMethod.is_verified) {
    throw new Error(payoutMethod.verification_message || "Worker payout method is not verified.");
  }

  if (!hasInterswitchPayoutConfig()) {
    return {
      started: false,
      payoutId: null as string | null,
      reason: "Interswitch payout configuration is incomplete.",
    };
  }

  const amountMajor = Number(earning.amount_minor) / 100;
  const walletBalance = await getPayoutWalletBalance();
  if (walletBalance.availableBalanceMajor < amountMajor) {
    return {
      started: false,
      payoutId: null as string | null,
      reason: `Interswitch wallet balance is too low for this payout. Available: NGN ${walletBalance.availableBalanceMajor.toFixed(2)}.`,
    };
  }

  const transactionReference = makeTransactionReference("CRW-PAY");
  const { data: payoutRecord, error: payoutRecordError } = await admin.rpc("create_payout_record", {
    p_earning_id: earningId,
    p_initiated_by_user_id: initiatedByUserId,
    p_transaction_reference: transactionReference,
    p_recipient_bank_code: payoutMethod.bank_code,
    p_recipient_bank_name: payoutMethod.bank_name,
    p_recipient_account_number: payoutMethod.account_number,
    p_recipient_account_name: payoutMethod.account_name,
    p_narration: "CrewPay task payout",
  });

  if (payoutRecordError || !payoutRecord) {
    throw new Error(payoutRecordError?.message ?? "Unable to create payout record.");
  }

  const providerPayload = await createPayoutTransfer({
    transactionReference,
    amountMajor,
    narration: "CrewPay task payout",
    sourceAccountName: env.interswitch.sourceAccountName,
    sourceAccountNumber: env.interswitch.sourceAccountNumber,
    recipientBankCode: payoutMethod.bank_code,
    recipientAccountNumber: payoutMethod.account_number,
  });

  const inferredStatus = inferPayoutStatus(providerPayload);

  await admin
    .from("payouts")
    .update({
      provider_payload: providerPayload,
    })
    .eq("id", payoutRecord);

  if (inferredStatus === "successful") {
    await admin.rpc("mark_payout_success", {
      p_payout_id: payoutRecord,
      p_payload: providerPayload,
      p_fee_minor: 0,
    });
  }

  if (inferredStatus === "failed") {
    await admin.rpc("mark_payout_failed", {
      p_payout_id: payoutRecord,
      p_reason: "Provider returned a failed payout status.",
      p_payload: providerPayload,
    });
  }

  return {
    started: true,
    payoutId: payoutRecord as string,
    reason: inferredStatus === "processing" ? "Payout is processing." : null,
  };
}

export async function markDirectTeamPayoutSuccess({
  payoutId,
  payload,
}: {
  payoutId: string;
  payload: Record<string, unknown>;
}) {
  const admin = createSupabaseAdminClient();
  const { data: payout, error } = await admin.from("payouts").select("*").eq("id", payoutId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!payout || payout.status === "successful") {
    return;
  }

  await admin
    .from("payouts")
    .update({
      status: "successful",
      last_error: null,
      provider_payload: payload,
    })
    .eq("id", payoutId);

  await admin.from("notifications").insert({
    user_id: payout.worker_user_id,
    team_id: payout.team_id,
    type: "payout_success",
    title: "Payout completed",
    body: "Your payout has been sent successfully.",
    metadata: {
      payout_id: payoutId,
      source: "team_member_payout",
    },
  });
}

export async function markDirectTeamPayoutFailure({
  payoutId,
  reason,
  payload,
}: {
  payoutId: string;
  reason: string;
  payload: Record<string, unknown>;
}) {
  const admin = createSupabaseAdminClient();
  const { data: payout, error } = await admin.from("payouts").select("*").eq("id", payoutId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!payout || payout.status === "failed") {
    return;
  }

  if (payout.status === "successful") {
    return;
  }

  const { data: wallet, error: walletError } = await admin
    .from("team_wallets")
    .select("available_balance_minor")
    .eq("team_id", payout.team_id)
    .maybeSingle();

  if (walletError || !wallet) {
    throw new Error(walletError?.message ?? "Team wallet not found.");
  }

  await admin
    .from("payouts")
    .update({
      status: "failed",
      last_error: reason,
      provider_payload: payload,
    })
    .eq("id", payoutId);

  await admin
    .from("team_wallets")
    .update({
      available_balance_minor: Number(wallet.available_balance_minor) + Number(payout.amount_minor),
    })
    .eq("team_id", payout.team_id);

  await admin.from("wallet_ledger_entries").insert({
    team_id: payout.team_id,
    type: "refund",
    amount_minor: Number(payout.amount_minor),
    payout_id: payout.id,
    created_by_user_id: payout.initiated_by_user_id,
    metadata: {
      reason,
      source: "team_member_payout",
      worker_user_id: payout.worker_user_id,
    },
  });

  await admin.from("notifications").insert({
    user_id: payout.worker_user_id,
    team_id: payout.team_id,
    type: "payout_failed",
    title: "Payout failed",
    body: reason,
    metadata: {
      payout_id: payoutId,
      source: "team_member_payout",
    },
  });
}

async function createDirectTeamPayoutFailureRecord({
  teamId,
  memberUserId,
  initiatedByUserId,
  amountMinor,
  narration,
  payoutMethod,
  memberName,
  reason,
  failureStage,
  providerPayload = {},
}: {
  teamId: string;
  memberUserId: string;
  initiatedByUserId: string;
  amountMinor: number;
  narration: string;
  payoutMethod: {
    bank_code: string;
    bank_name: string;
    account_number: string;
    account_name: string;
  };
  memberName: string;
  reason: string;
  failureStage: string;
  providerPayload?: Record<string, unknown>;
}) {
  const admin = createSupabaseAdminClient();
  const transactionReference = makeTransactionReference("CRW-PAY");
  const { data: payoutRecord, error: payoutRecordError } = await admin
    .from("payouts")
    .insert({
      team_id: teamId,
      worker_user_id: memberUserId,
      initiated_by_user_id: initiatedByUserId,
      transaction_reference: transactionReference,
      amount_minor: amountMinor,
      status: "failed",
      recipient_bank_code: payoutMethod.bank_code,
      recipient_bank_name: payoutMethod.bank_name,
      recipient_account_number: payoutMethod.account_number,
      recipient_account_name: payoutMethod.account_name,
      narration,
      last_error: reason,
      provider_payload: {
        source: "team_member_payout",
        failure_stage: failureStage,
        member_name: memberName,
        ...providerPayload,
      },
    })
    .select("id")
    .single();

  if (payoutRecordError || !payoutRecord) {
    throw new Error(payoutRecordError?.message ?? "Unable to record failed payout attempt.");
  }

  await Promise.allSettled([
    admin.from("wallet_ledger_entries").insert({
      team_id: teamId,
      type: "payout_failure",
      amount_minor: 0,
      payout_id: payoutRecord.id,
      created_by_user_id: initiatedByUserId,
      metadata: {
        source: "team_member_payout",
        worker_user_id: memberUserId,
        reason,
        failure_stage: failureStage,
      },
    }),
    admin.from("notifications").insert({
      user_id: memberUserId,
      team_id: teamId,
      type: "payout_failed",
      title: "Payout failed",
      body: reason,
      metadata: {
        payout_id: payoutRecord.id,
        source: "team_member_payout",
      },
    }),
  ]);

  return payoutRecord.id;
}

export async function attemptDirectTeamMemberPayout({
  teamId,
  memberUserId,
  initiatedByUserId,
  amountMinor,
  narration = "CrewPay team payout",
}: {
  teamId: string;
  memberUserId: string;
  initiatedByUserId: string;
  amountMinor: number;
  narration?: string;
}) {
  const admin = createSupabaseAdminClient();
  await requireTeamAdminRole(initiatedByUserId, teamId);

  if (amountMinor <= 0) {
    throw new Error("Assigned payout must be greater than 0 NGN.");
  }

  const { data: member, error: memberError } = await admin
    .from("team_members")
    .select("*, profile:profiles(*)")
    .eq("team_id", teamId)
    .eq("user_id", memberUserId)
    .eq("status", "active")
    .maybeSingle();

  if (memberError || !member) {
    throw new Error(memberError?.message ?? "Team member not found.");
  }

  const memberName = member.profile?.full_name ?? member.profile?.email ?? memberUserId;

  const { data: payoutMethod, error: payoutMethodError } = await admin
    .from("payout_methods")
    .select("*")
    .eq("user_id", memberUserId)
    .maybeSingle();

  if (payoutMethodError || !payoutMethod) {
    throw new Error("Member payout method is missing.");
  }

  async function failAttempt(reason: string, failureStage: string, providerPayload: Record<string, unknown> = {}) {
    try {
      const payoutId = await createDirectTeamPayoutFailureRecord({
        teamId,
        memberUserId,
        initiatedByUserId,
        amountMinor,
        narration,
        payoutMethod,
        memberName,
        reason,
        failureStage,
        providerPayload,
      });

      return {
        started: false,
        status: "failed" as DirectTeamPayoutStatus,
        payoutId,
        reason,
      };
    } catch {
      return {
        started: false,
        status: "failed" as DirectTeamPayoutStatus,
        payoutId: null as string | null,
        reason,
      };
    }
  }

  if (!payoutMethod.is_verified) {
    return failAttempt(payoutMethod.verification_message || "Member payout method is not verified.", "verification");
  }

  if (!hasInterswitchPayoutConfig()) {
    return failAttempt("Interswitch payout configuration is incomplete.", "config");
  }

  const { data: wallet, error: walletError } = await admin
    .from("team_wallets")
    .select("*")
    .eq("team_id", teamId)
    .maybeSingle();

  if (walletError || !wallet) {
    throw new Error(walletError?.message ?? "Team wallet not found.");
  }

  if (Number(wallet.available_balance_minor) < amountMinor) {
    return failAttempt("Team wallet balance is too low for this payout.", "team_wallet");
  }

  const amountMajor = amountMinor / 100;
  const walletBalance = await getPayoutWalletBalance();
  if (walletBalance.availableBalanceMajor < amountMajor) {
    return failAttempt(
      `Interswitch wallet balance is too low for this payout. Available: NGN ${walletBalance.availableBalanceMajor.toFixed(2)}.`,
      "provider_wallet",
    );
  }

  const transactionReference = makeTransactionReference("CRW-PAY");
  const { data: payoutRecord, error: payoutRecordError } = await admin
    .from("payouts")
    .insert({
      team_id: teamId,
      worker_user_id: memberUserId,
      initiated_by_user_id: initiatedByUserId,
      transaction_reference: transactionReference,
      amount_minor: amountMinor,
      status: "processing",
      recipient_bank_code: payoutMethod.bank_code,
      recipient_bank_name: payoutMethod.bank_name,
      recipient_account_number: payoutMethod.account_number,
      recipient_account_name: payoutMethod.account_name,
      narration,
      provider_payload: {
        source: "team_member_payout",
        member_name: memberName,
      },
    })
    .select("id")
    .single();

  if (payoutRecordError || !payoutRecord) {
    throw new Error(payoutRecordError?.message ?? "Unable to create payout record.");
  }

  const { error: reserveWalletError } = await admin
    .from("team_wallets")
    .update({
      available_balance_minor: Number(wallet.available_balance_minor) - amountMinor,
    })
    .eq("team_id", teamId);

  if (reserveWalletError) {
    await admin.from("payouts").delete().eq("id", payoutRecord.id);
    throw new Error(reserveWalletError.message);
  }

  const { error: ledgerError } = await admin.from("wallet_ledger_entries").insert({
    team_id: teamId,
    type: "payout_processing",
    amount_minor: -amountMinor,
    payout_id: payoutRecord.id,
    created_by_user_id: initiatedByUserId,
    metadata: {
      source: "team_member_payout",
      worker_user_id: memberUserId,
    },
  });

  if (ledgerError) {
    await admin
      .from("team_wallets")
      .update({
        available_balance_minor: Number(wallet.available_balance_minor),
      })
      .eq("team_id", teamId);
    await admin.from("payouts").delete().eq("id", payoutRecord.id);
    throw new Error(ledgerError.message);
  }

  try {
    const providerPayload = await createPayoutTransfer({
      transactionReference,
      amountMajor,
      narration,
      sourceAccountName: env.interswitch.sourceAccountName,
      sourceAccountNumber: env.interswitch.sourceAccountNumber,
      recipientBankCode: payoutMethod.bank_code,
      recipientAccountNumber: payoutMethod.account_number,
    });

    const inferredStatus = inferPayoutStatus(providerPayload);

    await admin
      .from("payouts")
      .update({
        provider_payload: providerPayload,
      })
      .eq("id", payoutRecord.id);

    if (inferredStatus === "successful") {
      await markDirectTeamPayoutSuccess({
        payoutId: payoutRecord.id,
        payload: providerPayload,
      });
    }

    if (inferredStatus === "failed") {
      await markDirectTeamPayoutFailure({
        payoutId: payoutRecord.id,
        reason: "Provider returned a failed payout status.",
        payload: providerPayload,
      });
    }

    return {
      started: inferredStatus !== "failed",
      status: inferredStatus as DirectTeamPayoutStatus,
      payoutId: payoutRecord.id,
      reason:
        inferredStatus === "successful"
          ? "Payout completed successfully."
          : inferredStatus === "processing"
            ? "Payout is processing."
            : "Provider returned a failed payout status.",
    };
  } catch (caught) {
    await markDirectTeamPayoutFailure({
      payoutId: payoutRecord.id,
      reason: caught instanceof Error ? caught.message : "Unable to create payout.",
      payload: {},
    });
    return {
      started: false,
      status: "failed" as DirectTeamPayoutStatus,
      payoutId: payoutRecord.id,
      reason: caught instanceof Error ? caught.message : "Unable to create payout.",
    };
  }
}

export async function attemptBulkTeamPayouts({
  teamId,
  initiatedByUserId,
}: {
  teamId: string;
  initiatedByUserId: string;
}) {
  await requireTeamAdminRole(initiatedByUserId, teamId);
  const members = await getTeamMembersWithPayouts(teamId);
  const payableMembers = members.filter((member) => member.status === "active" && member.assignedPayoutMinor > 0);

  const results: Array<{
    memberUserId: string;
    memberName: string;
    started: boolean;
    status: DirectTeamPayoutStatus;
    payoutId: string | null;
    reason: string | null;
  }> = [];

  for (const member of payableMembers) {
    try {
      const result = await attemptDirectTeamMemberPayout({
        teamId,
        memberUserId: member.user_id,
        initiatedByUserId,
        amountMinor: member.assignedPayoutMinor,
        narration: "CrewPay team payout",
      });

      results.push({
        memberUserId: member.user_id,
        memberName: member.profile?.full_name || member.profile?.email || member.user_id,
        started: result.started,
        status: result.status,
        payoutId: result.payoutId,
        reason: result.reason,
      });
    } catch (caught) {
      results.push({
        memberUserId: member.user_id,
        memberName: member.profile?.full_name || member.profile?.email || member.user_id,
        started: false,
        status: "skipped",
        payoutId: null,
        reason: caught instanceof Error ? caught.message : "Unable to pay this member.",
      });
    }
  }

  return {
    startedCount: results.filter((item) => item.status === "processing" || item.status === "successful").length,
    skippedCount: results.filter((item) => item.status === "skipped").length,
    failedCount: results.filter((item) => item.status === "failed").length,
    results,
  };
}
