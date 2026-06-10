package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/reviews/dtos"
	"github.com/kinsittr/kinsittr-api/reviews/messages"
	"github.com/kinsittr/kinsittr-api/shared/api"
)

func (c *ReviewsController) CreateParentReview(ctx *fiber.Ctx) error {
	userID, ok := reviewAuth(ctx, models.ParentUserRole)
	if !ok {
		return nil
	}
	bookingID, ok := reviewIDParam(ctx, "id")
	if !ok {
		return nil
	}

	var dto dtos.CreateReviewDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return reviewPipeError(ctx, messages.Invalid_Review_Request)
	}
	if ok, validationErr := api.ValidateAPIData(dto); !ok {
		return ctx.Status(validationErr.Code).JSON(fiber.Map{"success": false, "message": validationErr.Message})
	}

	res := c.pipe.CreateParentReview(ctx.Context(), userID, bookingID, dto)
	if !res.Success {
		return reviewPipeError(ctx, string(res.Message))
	}
	return reviewSuccess(ctx, fiber.StatusCreated, string(res.Message), res.Data)
}

func (c *ReviewsController) ListParentReviews(ctx *fiber.Ctx) error {
	userID, ok := reviewAuth(ctx, models.ParentUserRole)
	if !ok {
		return nil
	}

	dto := dtos.ListReviewsQueryDTO{Page: 1, Limit: 20}
	if err := ctx.QueryParser(&dto); err != nil {
		return reviewPipeError(ctx, messages.Invalid_Review_Request)
	}
	res := c.pipe.ListParentReviews(ctx.Context(), userID, dto)
	if !res.Success {
		return reviewPipeError(ctx, string(res.Message))
	}
	return reviewSuccess(ctx, fiber.StatusOK, string(res.Message), res.Data)
}

func (c *ReviewsController) ListPublicNannyReviews(ctx *fiber.Ctx) error {
	nannyID, ok := reviewIDParam(ctx, "id")
	if !ok {
		return nil
	}
	dto := dtos.ListReviewsQueryDTO{Page: 1, Limit: 20}
	if err := ctx.QueryParser(&dto); err != nil {
		return reviewPipeError(ctx, messages.Invalid_Review_Request)
	}
	res := c.pipe.ListPublicNannyReviews(ctx.Context(), nannyID, dto)
	if !res.Success {
		return reviewPipeError(ctx, string(res.Message))
	}
	return reviewSuccess(ctx, fiber.StatusOK, string(res.Message), res.Data)
}

func (c *ReviewsController) CreateNannyReview(ctx *fiber.Ctx) error {
	userID, ok := reviewAuth(ctx, models.NannyUserRole)
	if !ok {
		return nil
	}
	bookingID, ok := reviewIDParam(ctx, "id")
	if !ok {
		return nil
	}

	var dto dtos.CreateReviewDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return reviewPipeError(ctx, messages.Invalid_Review_Request)
	}
	if ok, validationErr := api.ValidateAPIData(dto); !ok {
		return ctx.Status(validationErr.Code).JSON(fiber.Map{"success": false, "message": validationErr.Message})
	}

	res := c.pipe.CreateNannyReview(ctx.Context(), userID, bookingID, dto)
	if !res.Success {
		return reviewPipeError(ctx, string(res.Message))
	}
	return reviewSuccess(ctx, fiber.StatusCreated, string(res.Message), res.Data)
}

func (c *ReviewsController) ListNannyReviews(ctx *fiber.Ctx) error {
	userID, ok := reviewAuth(ctx, models.NannyUserRole)
	if !ok {
		return nil
	}

	dto := dtos.ListReviewsQueryDTO{Page: 1, Limit: 20}
	if err := ctx.QueryParser(&dto); err != nil {
		return reviewPipeError(ctx, messages.Invalid_Review_Request)
	}
	res := c.pipe.ListNannyReviews(ctx.Context(), userID, dto)
	if !res.Success {
		return reviewPipeError(ctx, string(res.Message))
	}
	return reviewSuccess(ctx, fiber.StatusOK, string(res.Message), res.Data)
}
