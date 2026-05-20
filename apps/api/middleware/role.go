package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/models"
)

func RequireRole(role models.UserRole) fiber.Handler {
	return func(ctx *fiber.Ctx) error {
		authRole, ok := ctx.Locals("auth.role").(models.UserRole)
		if !ok || authRole != role {
			return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "forbidden_access",
			})
		}
		return ctx.Next()
	}
}

func RequireAdmin() fiber.Handler {
	return RequireRole(models.AdminUserRole)
}
