package utils

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/errors"
)

// JWTConfig holds JWT configuration
type JWTConfig struct {
SecretKey string
Duration  time.Duration
}

// Claims represents JWT claims
type Claims struct {
UserID   string `json:"user_id"`
Username string `json:"username"`
jwt.RegisteredClaims
}

// GenerateJWT generates a JWT token
func GenerateJWT(config JWTConfig, userID, username string) (string, error) {
claims := Claims{
UserID:   userID,
Username: username,
RegisteredClaims: jwt.RegisteredClaims{
ExpiresAt: jwt.NewNumericDate(time.Now().Add(config.Duration)),
IssuedAt:  jwt.NewNumericDate(time.Now()),
NotBefore: jwt.NewNumericDate(time.Now()),
},
}

token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
return token.SignedString([]byte(config.SecretKey))
}

// ValidateJWT validates a JWT token
func ValidateJWT(config JWTConfig, tokenString string) (*Claims, error) {
token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
return []byte(config.SecretKey), nil
})

if err != nil {
return nil, errors.NewUnauthorizedError("Invalid token")
}

if claims, ok := token.Claims.(*Claims); ok && token.Valid {
return claims, nil
}

return nil, errors.NewUnauthorizedError("Invalid token")
}

// AuthMiddleware creates JWT authentication middleware
func AuthMiddleware(config JWTConfig) gin.HandlerFunc {
return func(c *gin.Context) {
authHeader := c.GetHeader("Authorization")
if authHeader == "" {
SendError(c, errors.NewUnauthorizedError("Authorization header required"))
c.Abort()
return
}

// Check if it starts with "Bearer "
if !strings.HasPrefix(authHeader, "Bearer ") {
SendError(c, errors.NewUnauthorizedError("Invalid authorization header format"))
c.Abort()
return
}

tokenString := strings.TrimPrefix(authHeader, "Bearer ")
claims, err := ValidateJWT(config, tokenString)
if err != nil {
SendError(c, err)
c.Abort()
return
}

// Set user info in context
c.Set("user_id", claims.UserID)
c.Set("username", claims.Username)
c.Next()
}
}

// CORSMiddleware creates CORS middleware
func CORSMiddleware() gin.HandlerFunc {
return func(c *gin.Context) {
c.Header("Access-Control-Allow-Origin", "*")
c.Header("Access-Control-Allow-Credentials", "true")
c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

if c.Request.Method == "OPTIONS" {
c.AbortWithStatus(http.StatusNoContent)
return
}

c.Next()
}
}

// RateLimitMiddleware creates a simple rate limiting middleware
func RateLimitMiddleware(requestsPerMinute int) gin.HandlerFunc {
clients := make(map[string][]time.Time)

return func(c *gin.Context) {
clientIP := GetClientIP(c)
now := time.Now()

// Clean old requests
if times, exists := clients[clientIP]; exists {
var validTimes []time.Time
for _, t := range times {
if now.Sub(t) < time.Minute {
validTimes = append(validTimes, t)
}
}
clients[clientIP] = validTimes
}

// Check rate limit
if len(clients[clientIP]) >= requestsPerMinute {
SendError(c, errors.NewForbiddenError("Rate limit exceeded"))
c.Abort()
return
}

// Add current request
clients[clientIP] = append(clients[clientIP], now)
c.Next()
}
}

// LoggingMiddleware creates a logging middleware
func LoggingMiddleware() gin.HandlerFunc {
return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
param.ClientIP,
param.TimeStamp.Format(time.RFC1123),
param.Method,
param.Path,
param.Request.Proto,
param.StatusCode,
param.Latency,
param.Request.UserAgent(),
param.ErrorMessage,
)
})
}
