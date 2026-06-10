export type AdminAnalyticsBucket = "day" | "week" | "month";

export interface AdminAnalyticsParams {
  date_from?: string;
  date_to?: string;
  bucket?: AdminAnalyticsBucket;
  city_limit?: number;
  top_nannies_limit?: number;
}

export interface AdminCityBookingMetric {
  city: string;
  count: number;
}

export interface AdminAnalyticsTimeSeriesMetric {
  period: string;
  bookings_count: number;
  revenue: number;
}

export interface AdminTopNannyMetric {
  nanny_profile_id: string;
  display_name: string;
  city: string;
  province: string;
  completed_count: number;
  revenue: number;
  rating_avg: number;
}

export interface AdminRegistrationTrendMetric {
  period: string;
  parent_count: number;
  nanny_count: number;
}

export interface AdminAnalyticsData {
  total_revenue: number;
  platform_fee: number;
  platform_fee_rate: number;
  active_bookings: number;
  bookings_this_week: number;
  verified_nannies: number;
  pending_nannies: number;
  average_booking_value: number;
  bookings_by_city: AdminCityBookingMetric[];
  time_series: AdminAnalyticsTimeSeriesMetric[];
  top_nannies: AdminTopNannyMetric[];
  registration_trends: AdminRegistrationTrendMetric[];
}
