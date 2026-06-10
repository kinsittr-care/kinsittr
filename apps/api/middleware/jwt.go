package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/shared/token"
)

func RequireAuth(jwtSecret string) fiber.Handler {
	return func(ctx *fiber.Ctx) error {
		authHeader := strings.TrimSpace(ctx.Get(fiber.HeaderAuthorization))
		if authHeader == "" {
			return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "missing_authorization_header",
			})
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "invalid_authorization_header",
			})
		}

		claims, err := token.ValidateToken(parts[1], jwtSecret)
		if err != nil {
			return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "invalid_or_expired_token",
			})
		}

		ctx.Locals("auth.user_id", claims.UserID)
		ctx.Locals("auth.role", claims.Role)
		ctx.Locals("auth.claims", claims)
		return ctx.Next()
	}
}
