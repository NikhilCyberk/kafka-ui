package utils

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/errors"
)

// Response represents a standard API response
type Response struct {
	Success bool             `json:"success"`
	Data    interface{}      `json:"data,omitempty"`
	Error   *errors.AppError `json:"error,omitempty"`
	Message string           `json:"message,omitempty"`
}

// SendSuccess sends a successful response
func SendSuccess(c *gin.Context, data interface{}, message string) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    data,
		Message: message,
	})
}

// SendError sends an error response
func SendError(c *gin.Context, err error) {
	var appErr *errors.AppError
	if errors.IsAppError(err) {
		appErr = err.(*errors.AppError)
	} else {
		appErr = errors.NewInternalError(err.Error())
	}

	c.JSON(appErr.Code, Response{
		Success: false,
		Error:   appErr,
	})
}

// GenerateToken generates a random token
func GenerateToken(length int) (string, error) {
	bytes := make([]byte, length/2)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// ParseBrokerList parses a comma-separated broker list
func ParseBrokerList(brokerList string) []string {
	if brokerList == "" {
		return []string{}
	}

	brokers := strings.Split(brokerList, ",")
	for i, broker := range brokers {
		brokers[i] = strings.TrimSpace(broker)
	}
	return brokers
}

// ValidateBrokerList validates broker URLs
func ValidateBrokerList(brokers []string) error {
	if len(brokers) == 0 {
		return errors.NewValidationError("At least one broker is required")
	}

	for _, broker := range brokers {
		if broker == "" {
			return errors.NewValidationError("Broker URL cannot be empty")
		}
		if !strings.Contains(broker, ":") {
			return errors.NewValidationError("Invalid broker URL format. Expected host:port")
		}
	}
	return nil
}

// FormatTimestamp formats a timestamp for display
func FormatTimestamp(timestamp time.Time) string {
	return timestamp.Format("2006-01-02 15:04:05")
}

// ParseJSON safely parses JSON data
func ParseJSON(data []byte, v interface{}) error {
	return json.Unmarshal(data, v)
}

// ToJSON safely converts data to JSON
func ToJSON(v interface{}) ([]byte, error) {
	return json.Marshal(v)
}

// GetClientIP gets the real client IP address
func GetClientIP(c *gin.Context) string {
	// Check for forwarded headers
	if ip := c.GetHeader("X-Forwarded-For"); ip != "" {
		return strings.Split(ip, ",")[0]
	}
	if ip := c.GetHeader("X-Real-IP"); ip != "" {
		return ip
	}
	return c.ClientIP()
}

// SanitizeString removes potentially dangerous characters
func SanitizeString(input string) string {
	// Remove null bytes and other control characters
	return strings.Map(func(r rune) rune {
		if r < 32 && r != 9 && r != 10 && r != 13 {
			return -1
		}
		return r
	}, input)
}

// TruncateString truncates a string to a maximum length
func TruncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen-3] + "..."
}

// ContainsString checks if a slice contains a string
func ContainsString(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// RemoveString removes a string from a slice
func RemoveString(slice []string, item string) []string {
	result := make([]string, 0, len(slice))
	for _, s := range slice {
		if s != item {
			result = append(result, s)
		}
	}
	return result
}
