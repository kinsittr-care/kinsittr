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

export interface PaymentMethodData {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export interface PaymentMethodListData {
  items: PaymentMethodData[];
}
