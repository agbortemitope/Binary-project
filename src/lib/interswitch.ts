import { createHash, createHmac } from "crypto";

import { env, hasInterswitchFundingConfig, hasInterswitchPayoutConfig } from "@/lib/env";

type NullableJson = Record<string, unknown> | null;

function parseJsonObject(raw: string) {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function buildProviderErrorMessage(raw: string, fallback: string) {
  const payload = parseJsonObject(raw);
  const responseCode = payload?.["responseCode"];
  const responseMessage = payload?.["responseMessage"];

  if (responseCode === "INVALID_CREDENTIAL") {
    return "Interswitch payout access is not active for this merchant in the current environment yet.";
  }

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return typeof responseCode === "string"
      ? `${responseMessage} (${responseCode})`
      : responseMessage;
  }

  return raw || fallback;
}

export async function getInterswitchAccessToken() {
  if (!env.interswitch.clientId || !env.interswitch.secretKey) {
    throw new Error("Interswitch payout credentials are missing.");
  }

  const authorization = Buffer.from(
    `${env.interswitch.clientId}:${env.interswitch.secretKey}`,
  ).toString("base64");

  const response = await fetch(`${env.interswitch.passportBaseUrl}/passport/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unable to fetch Interswitch access token: ${buildProviderErrorMessage(body, "Authentication failed.")}`);
  }

  const payload = (await response.json()) as { access_token: string };
  return payload.access_token;
}

function asNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function verifyCollectionTransaction({
  transactionReference,
  amountMinor,
}: {
  transactionReference: string;
  amountMinor: number;
}) {
  if (!hasInterswitchFundingConfig()) {
    throw new Error("Interswitch funding configuration is missing.");
  }

  const url = new URL("/collections/api/v1/gettransaction.json", env.interswitch.transactionStatusBaseUrl);
  url.searchParams.set("merchantcode", env.interswitch.merchantCode);
  url.searchParams.set("transactionreference", transactionReference);
  url.searchParams.set("amount", String(amountMinor));

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unable to verify transaction: ${body}`);
  }

  return (await response.json()) as {
    Amount: number;
    MerchantReference: string;
    PaymentReference?: string;
    ResponseCode: string;
    ResponseDescription?: string;
  };
}

export function buildCheckoutPayload({
  amountMinor,
  txnRef,
  customerName,
  customerEmail,
  customerId,
  redirectUrl,
  payItemName,
}: {
  amountMinor: number;
  txnRef: string;
  customerName: string;
  customerEmail: string;
  customerId: string;
  redirectUrl: string;
  payItemName: string;
}) {
  if (!hasInterswitchFundingConfig()) {
    throw new Error("Interswitch funding configuration is missing.");
  }

  return {
    merchant_code: env.interswitch.merchantCode,
    pay_item_id: env.interswitch.payItemId,
    txn_ref: txnRef,
    amount: amountMinor,
    currency: 566,
    cust_name: customerName,
    cust_email: customerEmail,
    cust_id: customerId,
    pay_item_name: payItemName,
    site_redirect_url: redirectUrl,
  };
}

export async function validateRecipientBankAccount({
  bankCode,
  accountNumber,
  accountName,
}: {
  bankCode: string;
  accountNumber: string;
  accountName: string;
}) {
  if (!hasInterswitchPayoutConfig()) {
    return {
      isVerified: false,
      verificationMessage: "Payout verification is pending until Interswitch payout credentials are configured.",
      metadata: null as NullableJson,
    };
  }

  const accessToken = await getInterswitchAccessToken();
  const response = await fetch(`${env.interswitch.payoutBaseUrl}/api/v1/payouts/customer-lookup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ClientId: env.interswitch.clientId,
    },
    body: JSON.stringify({
      transactionReference: `CP-LOOKUP-${Date.now()}`,
      payoutChannel: "BANK_TRANSFER",
      recipient: {
        recipientAccount: accountNumber,
        recipientBank: bankCode,
        currencyCode: "NGN",
      },
      accountName,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    return {
      isVerified: false,
      verificationMessage: buildProviderErrorMessage(body, "Unable to verify bank details with Interswitch."),
      metadata: null as NullableJson,
    };
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const resolvedName =
    (payload["recipient"] as Record<string, unknown> | undefined)?.["recipientName"] ??
    (payload["recipient"] as Record<string, unknown> | undefined)?.["accountName"] ??
    accountName;

  return {
    isVerified: true,
    verificationMessage: "Bank details verified successfully.",
    metadata: payload,
    resolvedAccountName: String(resolvedName),
  };
}

export async function createPayoutTransfer({
  transactionReference,
  amountMajor,
  narration,
  sourceAccountName,
  sourceAccountNumber,
  recipientBankCode,
  recipientAccountNumber,
}: {
  transactionReference: string;
  amountMajor: number;
  narration: string;
  sourceAccountName: string;
  sourceAccountNumber: string;
  recipientBankCode: string;
  recipientAccountNumber: string;
}) {
  if (!hasInterswitchPayoutConfig()) {
    throw new Error("Interswitch payout configuration is missing.");
  }

  const accessToken = await getInterswitchAccessToken();

  const response = await fetch(`${env.interswitch.payoutBaseUrl}/api/v1/payouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ClientId: env.interswitch.clientId,
    },
    body: JSON.stringify({
      transactionReference,
      payoutChannel: "BANK_TRANSFER",
      currencyCode: "NGN",
      amount: amountMajor,
      narration,
      sourceAccountName,
      sourceAccountNumber,
      walletDetails: {
        walletId: env.interswitch.walletId,
        pin: env.interswitch.walletPin,
      },
      recipient: {
        recipientAccount: recipientAccountNumber,
        recipientBank: recipientBankCode,
        currencyCode: "NGN",
      },
      singleCall: true,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unable to create payout: ${buildProviderErrorMessage(body, "Payout request failed.")}`);
  }

  return (await response.json()) as Record<string, unknown>;
}

export async function getPayoutWalletBalance() {
  if (!hasInterswitchPayoutConfig()) {
    throw new Error("Interswitch payout configuration is missing.");
  }

  const accessToken = await getInterswitchAccessToken();
  const url = new URL(
    `/api/v1/wallet/balance/${encodeURIComponent(env.interswitch.merchantCode)}`,
    `${env.interswitch.payoutBaseUrl}/`,
  );
  url.searchParams.set("walletId", env.interswitch.walletId);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ClientId: env.interswitch.clientId,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Unable to fetch payout wallet balance: ${buildProviderErrorMessage(body, "Wallet balance lookup failed.")}`,
    );
  }

  const payload = (await response.json()) as Record<string, unknown>;

  return {
    payload,
    availableBalanceMajor:
      asNumber(payload["availableBalance"]) ??
      asNumber((payload["data"] as Record<string, unknown> | undefined)?.["availableBalance"]) ??
      0,
    ledgerBalanceMajor:
      asNumber(payload["ledgerBalance"]) ??
      asNumber((payload["data"] as Record<string, unknown> | undefined)?.["ledgerBalance"]) ??
      0,
  };
}

export async function getPayoutStatus(transactionReference: string) {
  if (!hasInterswitchPayoutConfig()) {
    throw new Error("Interswitch payout configuration is missing.");
  }

  const accessToken = await getInterswitchAccessToken();
  const response = await fetch(
    `${env.interswitch.payoutBaseUrl}/api/v1/payouts/${encodeURIComponent(transactionReference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ClientId: env.interswitch.clientId,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unable to fetch payout status: ${buildProviderErrorMessage(body, "Payout status lookup failed.")}`);
  }

  return (await response.json()) as Record<string, unknown>;
}

export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature || !env.interswitch.webhookSecret) {
    return false;
  }

  const expected = createHmac("sha512", env.interswitch.webhookSecret).update(rawBody).digest("hex");
  return expected.toLowerCase() === signature.toLowerCase();
}

export function makeTransactionReference(prefix: string) {
  const hash = createHash("sha1")
    .update(`${prefix}-${Date.now()}-${Math.random()}`)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();

  return `${prefix}-${hash}`;
}
