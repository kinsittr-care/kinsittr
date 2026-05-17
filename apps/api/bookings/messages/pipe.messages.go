package messages

const (
	// +
	Booking_Created                 = "booking_created"
	Booking_Listed                  = "bookings_listed"
	Booking_Found                   = "booking_found"
	Booking_Approved                = "booking_approved"
	Booking_Completed               = "booking_completed"
	Booking_Change_Request_Created  = "booking_change_request_created"
	Booking_Change_Request_Listed   = "booking_change_request_listed"
	Booking_Change_Request_Accepted = "booking_change_request_accepted"
	Booking_Change_Request_Declined = "booking_change_request_declined"

	// -
	Booking_Declined                       = "booking_declined"
	Booking_Cancelled                      = "booking_cancelled"
	Booking_Already_Exists                 = "booking_already_exists"
	Booking_Already_Approved               = "booking_already_approved"
	Nanny_Time_Unavailable                 = "nanny_time_unavailable"
	Booking_Start_In_Past                  = "booking_start_in_past"
	Invalid_Booking_Request                = "invalid_booking_request"
	Parent_Profile_Not_Found               = "parent_profile_not_found"
	Nanny_Profile_Not_Found                = "nanny_profile_not_found"
	Booking_Not_Found                      = "booking_not_found"
	Forbidden_Booking_Access               = "forbidden_booking_access"
	Cannot_Cancel_Booking                  = "cannot_cancel_booking"
	Cannot_Approve_Booking                 = "cannot_approve_booking"
	Cannot_Decline_Booking                 = "cannot_decline_booking"
	Cannot_Complete_Booking                = "cannot_complete_booking"
	Booking_Change_Request_Not_Found       = "booking_change_request_not_found"
	Booking_Change_Request_Already_Pending = "booking_change_request_already_pending"
	Cannot_Create_Booking_Change_Request   = "cannot_create_booking_change_request"
	Cannot_Resolve_Booking_Change_Request  = "cannot_resolve_booking_change_request"
	Cannot_Resolve_Own_Change_Request      = "cannot_resolve_own_change_request"
)
