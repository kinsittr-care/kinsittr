package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/dtos"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/shared/api"
)

func (c *BookingsController) CreateChangeRequest(ctx *fiber.Ctx) error {
	return c.createChangeRequest(ctx, "")
}

func (c *BookingsController) CreateParentChangeRequest(ctx *fiber.Ctx) error {
	return c.createChangeRequest(ctx, models.ParentUserRole)
}

func (c *BookingsController) CreateNannyChangeRequest(ctx *fiber.Ctx) error {
	return c.createChangeRequest(ctx, models.NannyUserRole)
}

func (c *BookingsController) createChangeRequest(ctx *fiber.Ctx, expectedRole models.UserRole) error {
	userID, role, ok := bookingAuth(ctx, expectedRole)
	if !ok {
		return nil
	}
	bookingID, ok := bookingIDParam(ctx, "id")
	if !ok {
		return nil
	}

	var dto dtos.CreateBookingChangeRequestDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "invalid_request_body"})
	}
	if ok, validationErr := api.ValidateAPIData(dto); !ok {
		return ctx.Status(validationErr.Code).JSON(fiber.Map{"success": false, "message": validationErr.Message})
	}

	res := c.pipe.CreateChangeRequest(ctx.Context(), userID, role, bookingID, dto)
	if !res.Success {
		return bookingPipeError(ctx, string(res.Message))
	}
	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "message": string(res.Message), "data": res.Data})
}

func (c *BookingsController) ListChangeRequests(ctx *fiber.Ctx) error {
	return c.listChangeRequests(ctx, "")
}

func (c *BookingsController) ListParentChangeRequests(ctx *fiber.Ctx) error {
	return c.listChangeRequests(ctx, models.ParentUserRole)
}

func (c *BookingsController) ListNannyChangeRequests(ctx *fiber.Ctx) error {
	return c.listChangeRequests(ctx, models.NannyUserRole)
}

func (c *BookingsController) listChangeRequests(ctx *fiber.Ctx, expectedRole models.UserRole) error {
	userID, role, ok := bookingAuth(ctx, expectedRole)
	if !ok {
		return nil
	}
	bookingID, ok := bookingIDParam(ctx, "id")
	if !ok {
		return nil
	}

	res := c.pipe.ListChangeRequests(ctx.Context(), userID, role, bookingID)
	if !res.Success {
		return bookingPipeError(ctx, string(res.Message))
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"success": true, "message": string(res.Message), "data": res.Data})
}

func (c *BookingsController) AcceptChangeRequest(ctx *fiber.Ctx) error {
	return c.acceptChangeRequest(ctx, "")
}

func (c *BookingsController) AcceptParentChangeRequest(ctx *fiber.Ctx) error {
	return c.acceptChangeRequest(ctx, models.ParentUserRole)
}

func (c *BookingsController) AcceptNannyChangeRequest(ctx *fiber.Ctx) error {
	return c.acceptChangeRequest(ctx, models.NannyUserRole)
}

func (c *BookingsController) acceptChangeRequest(ctx *fiber.Ctx, expectedRole models.UserRole) error {
	userID, role, ok := bookingAuth(ctx, expectedRole)
	if !ok {
		return nil
	}
	bookingID, requestID, ok := bookingAndRequestIDParams(ctx)
	if !ok {
		return nil
	}

	dto, ok := resolveChangeRequestDTO(ctx)
	if !ok {
		return nil
	}

	res := c.pipe.AcceptChangeRequest(ctx.Context(), userID, role, bookingID, requestID, dto)
	if !res.Success {
		return bookingPipeError(ctx, string(res.Message))
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"success": true, "message": string(res.Message), "data": res.Data})
}

func (c *BookingsController) DeclineChangeRequest(ctx *fiber.Ctx) error {
	return c.declineChangeRequest(ctx, "")
}

func (c *BookingsController) DeclineParentChangeRequest(ctx *fiber.Ctx) error {
	return c.declineChangeRequest(ctx, models.ParentUserRole)
}

func (c *BookingsController) DeclineNannyChangeRequest(ctx *fiber.Ctx) error {
	return c.declineChangeRequest(ctx, models.NannyUserRole)
}

func (c *BookingsController) declineChangeRequest(ctx *fiber.Ctx, expectedRole models.UserRole) error {
	userID, role, ok := bookingAuth(ctx, expectedRole)
	if !ok {
		return nil
	}
	bookingID, requestID, ok := bookingAndRequestIDParams(ctx)
	if !ok {
		return nil
	}

	dto, ok := resolveChangeRequestDTO(ctx)
	if !ok {
		return nil
	}

	res := c.pipe.DeclineChangeRequest(ctx.Context(), userID, role, bookingID, requestID, dto)
	if !res.Success {
		return bookingPipeError(ctx, string(res.Message))
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"success": true, "message": string(res.Message), "data": res.Data})
}

func (c *BookingsController) Complete(ctx *fiber.Ctx) error {
	userID, _, ok := bookingAuth(ctx, models.NannyUserRole)
	if !ok {
		return nil
	}
	bookingID, ok := bookingIDParam(ctx, "id")
	if !ok {
		return nil
	}

	res := c.pipe.Complete(ctx.Context(), userID, bookingID)
	if !res.Success {
		return bookingPipeError(ctx, string(res.Message))
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"success": true, "message": string(res.Message), "data": res.Data})
}

func bookingAuth(ctx *fiber.Ctx, expectedRole models.UserRole) (uuid.UUID, models.UserRole, bool) {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok || userID == uuid.Nil {
		_ = ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "invalid_or_expired_token"})
		return uuid.Nil, "", false
	}
	role, ok := ctx.Locals("auth.role").(models.UserRole)
	if !ok || (role != models.ParentUserRole && role != models.NannyUserRole) {
		_ = ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "message": messages.Forbidden_Booking_Access})
		return uuid.Nil, "", false
	}
	if expectedRole != "" && role != expectedRole {
		_ = ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "message": messages.Forbidden_Booking_Access})
		return uuid.Nil, "", false
	}
	return userID, role, true
}

func bookingIDParam(ctx *fiber.Ctx, name string) (uuid.UUID, bool) {
	id, err := uuid.Parse(ctx.Params(name))
	if err != nil {
		_ = ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": messages.Invalid_Booking_Request})
		return uuid.Nil, false
	}
	return id, true
}

func bookingAndRequestIDParams(ctx *fiber.Ctx) (uuid.UUID, uuid.UUID, bool) {
	bookingID, ok := bookingIDParam(ctx, "id")
	if !ok {
		return uuid.Nil, uuid.Nil, false
	}
	requestID, ok := bookingIDParam(ctx, "requestId")
	if !ok {
		return uuid.Nil, uuid.Nil, false
	}
	return bookingID, requestID, true
}

func resolveChangeRequestDTO(ctx *fiber.Ctx) (dtos.ResolveBookingChangeRequestDTO, bool) {
	var dto dtos.ResolveBookingChangeRequestDTO
	if len(ctx.Body()) == 0 {
		return dto, true
	}
	if err := ctx.BodyParser(&dto); err != nil {
		_ = ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "invalid_request_body"})
		return dto, false
	}
	if ok, validationErr := api.ValidateAPIData(dto); !ok {
		_ = ctx.Status(validationErr.Code).JSON(fiber.Map{"success": false, "message": validationErr.Message})
		return dto, false
	}
	return dto, true
}

func bookingPipeError(ctx *fiber.Ctx, message string) error {
	status := fiber.StatusBadRequest
	switch message {
	case messages.Parent_Profile_Not_Found, messages.Nanny_Profile_Not_Found, messages.Booking_Not_Found, messages.Booking_Change_Request_Not_Found:
		status = fiber.StatusNotFound
	case messages.Forbidden_Booking_Access, messages.Cannot_Resolve_Own_Change_Request:
		status = fiber.StatusForbidden
	case messages.Booking_Already_Exists, messages.Nanny_Time_Unavailable, messages.Booking_Change_Request_Already_Pending, messages.Booking_Already_Approved:
		status = fiber.StatusConflict
	case messages.Booking_Start_In_Past:
		status = fiber.StatusUnprocessableEntity
	}
	return ctx.Status(status).JSON(fiber.Map{"success": false, "message": message})
}
