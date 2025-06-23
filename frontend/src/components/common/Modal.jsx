import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 20,
    backdropFilter: 'blur(20px)',
    boxShadow: theme.palette.mode === 'light'
      ? '0 8px 32px rgba(0,0,0,0.08)'
      : '0 25px 50px rgba(0, 0, 0, 0.5)',
    maxWidth: '90vw',
    minWidth: 320,
    width: '100%',
    maxWidth: 380,
    maxHeight: '90vh',
  },
  '& .MuiBackdrop-root': {
    background: theme.palette.mode === 'light'
      ? 'rgba(0,0,0,0.12)'
      : 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(66, 165, 245, 0.03) 100%)'
    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(129, 140, 248, 0.05) 100%)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(3),
  '& .MuiTypography-root': {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.default,
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.action.hover,
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: theme.palette.action.selected,
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  background: theme.palette.background.default,
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2, 3),
  gap: theme.spacing(1),
}));

const Modal = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'xs',
  fullWidth = false,
  showCloseButton = true,
  ...props
}) => {
  const theme = useTheme();

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      TransitionProps={{
        enter: {
          duration: 300,
        },
        exit: {
          duration: 200,
        },
      }}
      {...props}
    >
      <StyledDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          {showCloseButton && (
            <IconButton
              onClick={onClose}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'text.primary',
                  background: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </StyledDialogTitle>

      <StyledDialogContent>
        {children}
      </StyledDialogContent>

      {actions && (
        <StyledDialogActions>
          {actions}
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
};

export default Modal; 