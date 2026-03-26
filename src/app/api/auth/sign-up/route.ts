import { NextRequest } from "next/server";

import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { validateRecipientBankAccount } from "@/lib/interswitch";

const signUpSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(8),
  bankCode: z.string().min(3),
  bankName: z.string().min(2),
  accountNumber: z.string().min(10),
  accountName: z.string().min(2),
  defaultRoleView: z.enum(["lead", "worker"]).default("worker"),
});

export async function POST(request: NextRequest) {
  try {
    const body = signUpSchema.parse(await request.json());
    const admin = createSupabaseAdminClient();

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.fullName,
        phone: body.phone,
      },
    });

    if (createError || !created.user) {
      return apiError(createError?.message ?? "Unable to create account.", 400);
    }

    const validation = await validateRecipientBankAccount({
      bankCode: body.bankCode,
      accountNumber: body.accountNumber,
      accountName: body.accountName,
    });

    const resolvedAccountName =
      "resolvedAccountName" in validation && validation.resolvedAccountName
        ? validation.resolvedAccountName
        : body.accountName;

    const { error: profileError } = await admin.from("profiles").upsert({
      user_id: created.user.id,
      full_name: body.fullName,
      email: body.email,
      phone: body.phone,
      default_role_view: body.defaultRoleView,
      payout_ready: validation.isVerified,
      onboarding_completed: true,
    });

    if (profileError) {
      return apiError(profileError.message, 400);
    }

    const { error: payoutError } = await admin.from("payout_methods").upsert({
      user_id: created.user.id,
      bank_code: body.bankCode,
      bank_name: body.bankName,
      account_number: body.accountNumber,
      account_name: resolvedAccountName,
      is_verified: validation.isVerified,
      verified_at: validation.isVerified ? new Date().toISOString() : null,
      verification_message: validation.verificationMessage ?? null,
      provider_metadata: validation.metadata ?? {},
    });

    if (payoutError) {
      return apiError(payoutError.message, 400);
    }

    return apiSuccess({
      payoutReady: validation.isVerified,
      verificationMessage: validation.verificationMessage ?? null,
    }, 201);
  } catch (caught) {
    if (caught instanceof z.ZodError) {
      return apiError("Please complete all required signup fields.", 400, caught.flatten());
    }

    return apiError(caught instanceof Error ? caught.message : "Unable to create account.", 500);
  }
}
