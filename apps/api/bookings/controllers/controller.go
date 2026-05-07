package controllers

import "github.com/kinsittr/kinsittr-api/bookings/pipes"

type BookingsController struct {
	pipe *pipes.BookingsPipe
}

func NewBookingsController(pipe *pipes.BookingsPipe) *BookingsController {
	return &BookingsController{pipe: pipe}
}
