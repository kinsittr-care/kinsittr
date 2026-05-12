package messages

const (
	// +
	Booking_Created  = "booking_created"
	Booking_Listed   = "bookings_listed"
	Booking_Found    = "booking_found"
	Booking_Approved = "booking_approved"

	// -
	Booking_Declined         = "booking_declined"
	Booking_Cancelled        = "booking_cancelled"
	Booking_Already_Exists   = "booking_already_exists"
	Booking_Already_Approved = "booking_already_approved"
	Nanny_Time_Unavailable   = "nanny_time_unavailable"
	Booking_Start_In_Past    = "booking_start_in_past"
	Invalid_Booking_Request  = "invalid_booking_request"
	Parent_Profile_Not_Found = "parent_profile_not_found"
	Nanny_Profile_Not_Found  = "nanny_profile_not_found"
	Booking_Not_Found        = "booking_not_found"
	Forbidden_Booking_Access = "forbidden_booking_access"
	Cannot_Cancel_Booking    = "cannot_cancel_booking"
	Cannot_Approve_Booking   = "cannot_approve_booking"
	Cannot_Decline_Booking   = "cannot_decline_booking"
)
