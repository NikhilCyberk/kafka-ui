import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${theme.palette[color].main}15 0%, ${theme.palette[color].light}10 100%)`,
  border: `1px solid ${theme.palette[color].main}20`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 16px 40px ${theme.palette[color].main}20`,
    border: `1px solid ${theme.palette[color].main}40`,
  },
}));

const IconWrapper = styled(Box)(({ theme, color = 'primary' }) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].light} 100%)`,
  color: theme.palette.common.white,
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
}));

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  trendValue,
  onClick,
  ...props
}) => {
  const theme = useTheme();

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'success';
    if (trend === 'down') return 'error';
    return 'info';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  return (
    <StyledCard
      color={color}
      onClick={onClick}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      {...props}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <IconWrapper color={color}>
            {icon}
          </IconWrapper>
          {trend && (
            <Chip
              label={`${getTrendIcon(trend)} ${trendValue}`}
              size="small"
              color={getTrendColor(trend)}
              sx={{
                background: `rgba(${getTrendColor(trend) === 'success' ? '16, 185, 129' : '239, 68, 68'}, 0.1)`,
                color: theme.palette[getTrendColor(trend)].main,
                border: `1px solid ${theme.palette[getTrendColor(trend)].main}30`,
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          {value}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            mb: 1,
            fontSize: { xs: '1rem', sm: '1.125rem' },
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default StatCard; 