import React from 'react';
import { Button as MuiButton, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(MuiButton)(({ theme, variant, size, color = 'primary' }) => {
  const baseStyles = {
    borderRadius: 12,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
      transition: 'left 0.5s',
    },
    '&:hover::before': {
      left: '100%',
    },
  };

  const sizeStyles = {
    small: {
      padding: '8px 16px',
      fontSize: '0.875rem',
      minHeight: 36,
    },
    medium: {
      padding: '10px 24px',
      fontSize: '1rem',
      minHeight: 44,
    },
    large: {
      padding: '12px 32px',
      fontSize: '1.125rem',
      minHeight: 52,
    },
  };

  if (variant === 'contained') {
    return {
      ...baseStyles,
      ...sizeStyles[size || 'medium'],
      background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].light} 100%)`,
      color: theme.palette.common.white,
      border: 'none',
      boxShadow: `0 4px 12px ${theme.palette[color].main}30`,
      '&:hover': {
        background: `linear-gradient(135deg, ${theme.palette[color].dark} 0%, ${theme.palette[color].main} 100%)`,
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 20px ${theme.palette[color].main}40`,
      },
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: `0 2px 8px ${theme.palette[color].main}30`,
      },
      '&:disabled': {
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'rgba(255, 255, 255, 0.3)',
        boxShadow: 'none',
        transform: 'none',
      },
    };
  }

  if (variant === 'outlined') {
    return {
      ...baseStyles,
      ...sizeStyles[size || 'medium'],
      background: 'transparent',
      color: theme.palette[color].main,
      border: `2px solid ${theme.palette[color].main}40`,
      '&:hover': {
        background: `${theme.palette[color].main}10`,
        border: `2px solid ${theme.palette[color].main}`,
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 12px ${theme.palette[color].main}20`,
      },
      '&:active': {
        transform: 'translateY(0)',
      },
      '&:disabled': {
        border: '2px solid rgba(255, 255, 255, 0.1)',
        color: 'rgba(255, 255, 255, 0.3)',
        transform: 'none',
        boxShadow: 'none',
      },
    };
  }

  if (variant === 'text') {
    return {
      ...baseStyles,
      ...sizeStyles[size || 'medium'],
      background: 'transparent',
      color: theme.palette[color].main,
      border: 'none',
      '&:hover': {
        background: `${theme.palette[color].main}10`,
        transform: 'translateY(-1px)',
      },
      '&:active': {
        transform: 'translateY(0)',
      },
      '&:disabled': {
        color: 'rgba(255, 255, 255, 0.3)',
        transform: 'none',
      },
    };
  }

  // Default variant (ghost)
  return {
    ...baseStyles,
    ...sizeStyles[size || 'medium'],
    background: 'rgba(255, 255, 255, 0.05)',
    color: theme.palette.text.primary,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:disabled': {
      background: 'rgba(255, 255, 255, 0.02)',
      color: 'rgba(255, 255, 255, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      transform: 'none',
      boxShadow: 'none',
    },
  };
});

const Button = ({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  size = 'medium',
  startIcon,
  endIcon,
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  ...props 
}) => {
  const theme = useTheme();

  return (
    <StyledButton
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={loading ? null : startIcon}
      endIcon={loading ? null : endIcon}
      sx={{
        ...(loading && {
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 16,
            height: 16,
            margin: 'auto',
            border: '2px solid transparent',
            borderTopColor: theme.palette.common.white,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          },
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }),
      }}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </StyledButton>
  );
};

export default Button; 