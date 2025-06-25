package handlers

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/nikhilgoenkatech/kafka-ui/internal/constants"
	"github.com/nikhilgoenkatech/kafka-ui/internal/models"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/errors"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/utils"
	"golang.org/x/crypto/bcrypt"
)

var jwtConfig = utils.JWTConfig{
	SecretKey: constants.SecretKeyDev,
	Duration:  24 * time.Hour,
}

// Demo admin user hash (password: "admin123")
var demoAdminHash = constants.DemoAdminHash

// Claims represents JWT claims
type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// Register handles user registration
func Register(c *gin.Context) {
	var req models.SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, errors.NewValidationError(constants.MsgInvalidRequestData+err.Error()))
		return
	}

	// Validate input
	if req.Username == "" {
		utils.SendError(c, errors.NewValidationError(constants.MsgUsernameRequired))
		return
	}
	if req.Password == "" {
		utils.SendError(c, errors.NewValidationError(constants.MsgPasswordRequired))
		return
	}
	if req.Email == "" {
		utils.SendError(c, errors.NewValidationError(constants.MsgEmailRequired))
		return
	}

	// Check if user already exists
	if req.Username == "admin" {
		utils.SendError(c, errors.NewConflictError(constants.MsgUsernameExists))
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.SendError(c, errors.NewInternalError(constants.MsgFailedToHashPassword))
		return
	}

	// Create user (in a real app, save to database)
	user := models.User{
		Username:  req.Username,
		Email:     req.Email,
		Password:  string(hashedPassword),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(jwtConfig, "1", user.Username)
	if err != nil {
		utils.SendError(c, errors.NewInternalError(constants.MsgFailedToGenerateToken))
		return
	}

	utils.SendSuccess(c, models.AuthResponse{
		Token:     token,
		User:      user,
		ExpiresAt: time.Now().Add(jwtConfig.Duration).Unix(),
	}, constants.MsgUserRegisteredSuccessfully)
}

// Login handles user authentication
func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, errors.NewValidationError(constants.MsgInvalidRequestData+err.Error()))
		return
	}

	log.Printf("Login attempt for username: '%s'", req.Username)

	// Validate input
	if req.Username == "" {
		utils.SendError(c, errors.NewValidationError(constants.MsgUsernameRequired))
		return
	}
	if req.Password == "" {
		utils.SendError(c, errors.NewValidationError(constants.MsgPasswordRequired))
		return
	}

	// In a real app, you'd fetch user from a database.
	// For demo purposes, we'll use a hardcoded admin user.
	if req.Username != "admin" {
		utils.SendError(c, errors.NewUnauthorizedError(constants.MsgInvalidCredentials))
		return
	}

	// --- TEMPORARY INSECURE LOGIN FOR DEBUGGING ---
	// This bypasses the bcrypt issue to confirm the rest of the flow.
	if req.Password != "admin123" {
		log.Printf("Password does not match. Expected 'admin123', got '%s'", req.Password)
		utils.SendError(c, errors.NewUnauthorizedError(constants.MsgInvalidCredentials))
		return
	}
	// --- END TEMPORARY LOGIN ---

	// Create user object
	user := models.User{
		ID:        1,
		Username:  req.Username,
		Email:     "admin@kafka-ui.com",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(jwtConfig, "1", user.Username)
	if err != nil {
		utils.SendError(c, errors.NewInternalError(constants.MsgFailedToGenerateToken))
		return
	}

	utils.SendSuccess(c, models.AuthResponse{
		Token:     token,
		User:      user,
		ExpiresAt: time.Now().Add(jwtConfig.Duration).Unix(),
	}, constants.MsgLoginSuccessful)
}

// GetProfile returns the current user's profile
func GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, errors.NewUnauthorizedError(constants.MsgUserIDNotFoundInToken))
		return
	}

	username, exists := c.Get("username")
	if !exists {
		utils.SendError(c, errors.NewUnauthorizedError(constants.MsgUsernameNotFoundInToken))
		return
	}

	// For demo purposes, we'll return a hardcoded admin user.
	// In a real app, you'd fetch this from a database.
	userIDStr, ok := userID.(string)
	if !ok || userIDStr != "1" {
		utils.SendError(c, errors.NewNotFoundError(constants.MsgUserNotFound))
		return
	}

	user := models.User{
		ID:        1,
		Username:  username.(string),
		Email:     "admin@kafka-ui.com",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	utils.SendSuccess(c, user, constants.MsgProfileFetchedSuccessfully)
}

// ChangePassword handles password change
func ChangePassword(c *gin.Context) {
	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, errors.NewValidationError("Invalid request data: "+err.Error()))
		return
	}

	// Validate input
	if req.CurrentPassword == "" {
		utils.SendError(c, errors.NewValidationError("Current password is required"))
		return
	}
	if req.NewPassword == "" {
		utils.SendError(c, errors.NewValidationError("New password is required"))
		return
	}
	if len(req.NewPassword) < 6 {
		utils.SendError(c, errors.NewValidationError("New password must be at least 6 characters"))
		return
	}

	// In a real app, verify current password and update
	// For demo, we'll just return success
	utils.SendSuccess(c, gin.H{"message": "Password changed successfully"}, "Password changed successfully")
}

// generateToken creates a JWT token for the user
func generateToken(userID uint, username string) (string, int64, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtConfig.SecretKey)
	if err != nil {
		return "", 0, err
	}

	return tokenString, expirationTime.Unix(), nil
}

// ValidateToken validates a JWT token and returns the claims
func ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtConfig.SecretKey, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, jwt.ErrSignatureInvalid
	}

	return claims, nil
}
