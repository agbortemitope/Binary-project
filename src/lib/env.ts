function getEnvValue(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
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
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  },
  get cronSecret() {
    return process.env.CRON_SECRET ?? "";
  },
  interswitch: {
    get merchantCode() {
      return process.env.INTERSWITCH_MERCHANT_CODE ?? "";
    },
    get payItemId() {
      return process.env.INTERSWITCH_PAY_ITEM_ID ?? "";
    },
    get clientId() {
      return process.env.INTERSWITCH_CLIENT_ID ?? "";
    },
    get secretKey() {
      return process.env.INTERSWITCH_SECRET_KEY ?? "";
    },
    get walletId() {
      return process.env.INTERSWITCH_PAYOUT_WALLET_ID ?? "";
    },
    get walletPin() {
      return process.env.INTERSWITCH_PAYOUT_WALLET_PIN ?? "";
    },
    get sourceAccountName() {
      return process.env.INTERSWITCH_SOURCE_ACCOUNT_NAME ?? "";
    },
    get sourceAccountNumber() {
      return process.env.INTERSWITCH_SOURCE_ACCOUNT_NUMBER ?? "";
    },
    get webhookSecret() {
      return process.env.INTERSWITCH_WEBHOOK_SECRET ?? "";
    },
    get mode() {
      return (process.env.INTERSWITCH_MODE ?? "TEST").toUpperCase() === "LIVE" ? "LIVE" : "TEST";
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
      return process.env.INTERSWITCH_PAYOUT_BASE_URL ?? "";
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
