function getEnvValue(name: string) {
  const value = process.env[name];
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return normalized;
}

function getOptionalEnvValue(name: string, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

export const env = {
  get supabaseUrl() {
    return getEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return getEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get serviceRoleKey() {
    return getEnvValue("SUPABASE_SERVICE_ROLE_KEY");
  },
  get appUrl() {
    return getOptionalEnvValue("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  },
  get cronSecret() {
    return getOptionalEnvValue("CRON_SECRET");
  },
  interswitch: {
    get merchantCode() {
      return getOptionalEnvValue("INTERSWITCH_MERCHANT_CODE");
    },
    get payItemId() {
      return getOptionalEnvValue("INTERSWITCH_PAY_ITEM_ID");
    },
    get clientId() {
      return getOptionalEnvValue("INTERSWITCH_CLIENT_ID");
    },
    get secretKey() {
      return getOptionalEnvValue("INTERSWITCH_SECRET_KEY");
    },
    get walletId() {
      return getOptionalEnvValue("INTERSWITCH_PAYOUT_WALLET_ID");
    },
    get walletPin() {
      return getOptionalEnvValue("INTERSWITCH_PAYOUT_WALLET_PIN");
    },
    get sourceAccountName() {
      return getOptionalEnvValue("INTERSWITCH_SOURCE_ACCOUNT_NAME");
    },
    get sourceAccountNumber() {
      return getOptionalEnvValue("INTERSWITCH_SOURCE_ACCOUNT_NUMBER");
    },
    get webhookSecret() {
      return getOptionalEnvValue("INTERSWITCH_WEBHOOK_SECRET");
    },
    get mode() {
      return getOptionalEnvValue("INTERSWITCH_MODE", "TEST").toUpperCase() === "LIVE" ? "LIVE" : "TEST";
    },
    get passportBaseUrl() {
      return this.mode === "LIVE"
        ? "https://api.interswitchng.com"
        : "https://qa.interswitchng.com";
    },
    get checkoutScriptUrl() {
      return this.mode === "LIVE"
        ? "https://newwebpay.interswitchng.com/inline-checkout.js"
        : "https://newwebpay.qa.interswitchng.com/inline-checkout.js";
    },
    get checkoutFormUrl() {
      return this.mode === "LIVE"
        ? "https://newwebpay.interswitchng.com/collections/w/pay"
        : "https://newwebpay.qa.interswitchng.com/collections/w/pay";
    },
    get transactionStatusBaseUrl() {
      return this.mode === "LIVE"
        ? "https://webpay.interswitchng.com"
        : "https://qa.interswitchng.com";
    },
    get payoutBaseUrl() {
      return getOptionalEnvValue("INTERSWITCH_PAYOUT_BASE_URL");
    },
  },
};

export function hasInterswitchFundingConfig() {
  return Boolean(env.interswitch.merchantCode && env.interswitch.payItemId);
}

export function hasInterswitchPayoutConfig() {
  return Boolean(
      env.interswitch.merchantCode &&
      env.interswitch.clientId &&
      env.interswitch.secretKey &&
      env.interswitch.walletId &&
      env.interswitch.walletPin &&
      env.interswitch.sourceAccountName &&
      env.interswitch.sourceAccountNumber &&
      env.interswitch.payoutBaseUrl,
  );
}
