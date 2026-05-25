export interface StripeConnectData {
  account_id: string;
  url: string;
  onboarded: boolean;
}

export interface StripeStatusData {
  account_id?: string;
  onboarded: boolean;
}

export interface SetupIntentData {
  customer_id: string;
  client_secret: string;
}
