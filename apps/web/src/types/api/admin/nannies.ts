import type { AdminBookingListData } from "./shared";
import type { AdminNanny, AdminVerificationStatus } from "./screening";

export interface ListAdminNanniesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminVerificationStatus;
  city?: string;
}

export interface AdminNannyEarnings {
  completed_bookings: number;
  total_earnings: number;
}

export interface AdminNannyDetailData {
  nanny: AdminNanny;
  bookings: AdminBookingListData;
  earnings: AdminNannyEarnings;
}
