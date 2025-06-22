package errors

import (
	"fmt"
	"net/http"
)

type AppError struct {
	Type    string `json:"type"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
	Code    int    `json:"code"`
}

func (e *AppError) Error() string {
	return fmt.Sprintf("[%s] %s", e.Type, e.Message)
}

func NewValidationError(message string) *AppError {
	return &AppError{
		Type:    "VALIDATION_ERROR",
		Message: message,
		Code:    http.StatusBadRequest,
	}
}

func NewNotFoundError(resource string) *AppError {
	return &AppError{
		Type:    "NOT_FOUND",
		Message: fmt.Sprintf("%s not found", resource),
		Code:    http.StatusNotFound,
	}
}

func NewUnauthorizedError(message string) *AppError {
	return &AppError{
		Type:    "UNAUTHORIZED",
		Message: message,
		Code:    http.StatusUnauthorized,
	}
}

func NewForbiddenError(message string) *AppError {
	return &AppError{
		Type:    "FORBIDDEN",
		Message: message,
		Code:    http.StatusForbidden,
	}
}

func NewInternalError(message string) *AppError {
	return &AppError{
		Type:    "INTERNAL_ERROR",
		Message: message,
		Code:    http.StatusInternalServerError,
	}
}

func NewKafkaError(message string) *AppError {
	return &AppError{
		Type:    "KAFKA_ERROR",
		Message: message,
		Code:    http.StatusInternalServerError,
	}
}

func NewConflictError(message string) *AppError {
	return &AppError{
		Type:    "CONFLICT",
		Message: message,
		Code:    http.StatusConflict,
	}
}

func IsAppError(err error) bool {
	_, ok := err.(*AppError)
	return ok
}
