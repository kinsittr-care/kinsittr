package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/reviews/dtos"
	"github.com/kinsittr/kinsittr-api/reviews/messages"
	"github.com/kinsittr/kinsittr-api/shared/api"
)

func (c *ReviewsController) ListAdminReviews(ctx *fiber.Ctx) error {
	dto := dtos.ListReviewsQueryDTO{Page: 1, Limit: 20}
	if err := ctx.QueryParser(&dto); err != nil {
		return reviewPipeError(ctx, messages.Invalid_Review_Request)
	}
	res := c.pipe.ListAdminReviews(ctx.Context(), dto)
	if !res.Success {
		return reviewPipeError(ctx, string(res.Message))
	}
	return reviewSuccess(ctx, fiber.StatusOK, string(res.Message), res.Data)
}

func (c *ReviewsController) GetAdminReview(ctx *fiber.Ctx) error {
	reviewID, ok := reviewIDParam(ctx, "id")
	if !ok {
		return nil
	}
	res := c.pipe.GetAdminReview(ctx.Context(), reviewID, ctx.Query("target"))
	if !res.Success {
		return reviewPipeError(ctx, string(res.Message))
	}
	return reviewSuccess(ctx, fiber.StatusOK, string(res.Message), res.Data)
}

func (c *ReviewsController) FlagReview(ctx *fiber.Ctx) error {
	return c.reviewModerationAction(ctx, true)
}

func (c *ReviewsController) UnflagReview(ctx *fiber.Ctx) error {
	return c.reviewModerationAction(ctx, false)
}

func (c *ReviewsController) reviewModerationAction(ctx *fiber.Ctx, flag bool) error {
	adminUserID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok || adminUserID == uuid.Nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "invalid_or_expired_token"})
	}
	reviewID, ok := reviewIDParam(ctx, "id")
	if !ok {
		return nil
	}

	var dto dtos.AdminReviewActionDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return reviewPipeError(ctx, messages.Invalid_Review_Request)
	}
	if ok, validationErr := api.ValidateAPIData(dto); !ok {
		return ctx.Status(validationErr.Code).JSON(fiber.Map{"success": false, "message": validationErr.Message})
	}

	if flag {
		res := c.pipe.FlagReview(ctx.Context(), adminUserID, reviewID, ctx.Query("target"), dto)
		if !res.Success {
			return reviewPipeError(ctx, string(res.Message))
		}
		return reviewSuccess(ctx, fiber.StatusOK, string(res.Message), res.Data)
	}
	res := c.pipe.UnflagReview(ctx.Context(), adminUserID, reviewID, ctx.Query("target"), dto)
	if !res.Success {
		return reviewPipeError(ctx, string(res.Message))
	}
	return reviewSuccess(ctx, fiber.StatusOK, string(res.Message), res.Data)
}

func (c *ReviewsController) ListReviewActions(ctx *fiber.Ctx) error {
	reviewID, ok := reviewIDParam(ctx, "id")
	if !ok {
		return nil
	}
	dto := dtos.ListReviewsQueryDTO{Page: 1, Limit: 20}
	if err := ctx.QueryParser(&dto); err != nil {
		return reviewPipeError(ctx, messages.Invalid_Review_Request)
	}
	res := c.pipe.ListReviewActions(ctx.Context(), reviewID, dto.Target, dto.Page, dto.Limit)
	if !res.Success {
		return reviewPipeError(ctx, string(res.Message))
	}
	return reviewSuccess(ctx, fiber.StatusOK, string(res.Message), res.Data)
}
