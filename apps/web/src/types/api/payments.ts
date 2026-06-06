export interface StripeConnectData {
  account_id: string;
  url: string;
  onboarded: boolean;
}

export interface StripeStatusData {
  account_id?: string;
  onboarded: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  requirements_currently_due: string[];
  requirements_eventually_due: string[];
  disabled_reason?: string;
}

export interface StripeBalanceAmountData {
  amount: number;
  currency: string;
}

export interface StripeBalanceData {
  available: StripeBalanceAmountData[];
  pending: StripeBalanceAmountData[];
}

export interface StripePayoutData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrival_date: string;
  created_at: string;
}

export interface StripePayoutListData {
  items: StripePayoutData[];
}

export type NannyPayoutSchedule = "daily" | "weekly";

export interface NannyPayoutSettingsData {
  schedule: NannyPayoutSchedule;
}

export interface UpdateNannyPayoutSettingsPayload {
  schedule: NannyPayoutSchedule;
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
