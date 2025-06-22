package middleware

import (
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/utils"
)

var jwtConfig = utils.JWTConfig{
	SecretKey: "your-secret-key-change-in-production",
	Duration:  24 * time.Hour,
}

// AuthMiddleware validates JWT tokens
func AuthMiddleware() gin.HandlerFunc {
	return utils.AuthMiddleware(jwtConfig)
}

// OptionalAuthMiddleware allows requests with or without authentication
func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			if claims, err := utils.ValidateJWT(jwtConfig, tokenString); err == nil {
				c.Set("user_id", claims.UserID)
				c.Set("username", claims.Username)
			}
		}
		c.Next()
	}
}
