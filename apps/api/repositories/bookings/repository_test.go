package bookings

// Integration tests for BookingsRepository.
// Run with: go test -tags integration ./repositories/bookings/...
//
// Requires a running Postgres instance. Set DATABASE_URL in the environment
// or use testcontainers-go to spin one up automatically.
//
// Cases to cover:
//
//   CreateBooking
//     - inserts a booking and returns it with the generated ID
//     - returns ErrBookingAlreadyExists on a unique conflict
//
//   HasParentActiveBookingWithNanny
//     - returns true when a pending/approved booking overlaps the given window
//     - returns false when no overlap exists
//
//   HasNannyApprovedBookingConflict
//     - returns true when an approved booking overlaps
//     - returns false for pending/declined/cancelled bookings in that window
//
//   ListParentBookings
//     - paginates correctly (page, limit)
//     - filters by status
//     - filters by date_from / date_to boundaries
//     - returns total count separate from the page slice
//
//   GetParentBookingByID
//     - returns the booking when it belongs to the parent
//     - returns zero-value when the booking belongs to a different parent
//
//   CancelParentBooking
//     - transitions a pending booking to cancelled
//     - returns ErrNannyTimeUnavailable (or zero result) when booking is not pending
//
//   ListNannyBookings / GetNannyBookingByID
//     - mirror the parent variants scoped to nanny profile ID
//
//   ApproveNannyBooking
//     - transitions pending → approved
//     - returns ErrNannyTimeUnavailable when another approved booking already occupies the slot
//
//   DeclineNannyBooking
//     - transitions pending → declined
