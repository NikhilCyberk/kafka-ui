import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';

const Login = ({ onSuccess, inModal, switchToSignup }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);
    if (result.success) {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const content = (
    <Box sx={{ p: inModal ? 0 : 2, width: inModal ? 1 : undefined }}>
      <Box textAlign="center" mb={2}>
        <Typography variant="h5" component="h1" gutterBottom fontWeight={700}>
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14 }}>
          Sign in to your Kafka UI account
        </Typography>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1.5, fontSize: 13 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          margin="dense"
          required
          autoFocus
          sx={{ mb: 1.5, fontSize: 14, '& .MuiInputBase-input': { py: 1 } }}
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          margin="dense"
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2, fontSize: 14, '& .MuiInputBase-input': { py: 1 } }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          size="medium"
          disabled={loading || !formData.username || !formData.password}
          startIcon={loading ? <CircularProgress size={18} /> : <FaSignInAlt />}
          sx={{
            borderRadius: 2,
            py: 1,
            mb: 1.5,
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
            Don't have an account?{' '}
            {inModal && switchToSignup ? (
              <Link component="button" onClick={e => { e.preventDefault(); switchToSignup(); }} sx={{ fontWeight: 600, fontSize: 13 }}>
                Sign up
              </Link>
            ) : (
              <Link component={RouterLink} to="/signup" sx={{ fontWeight: 600, fontSize: 13 }}>
                Sign up
              </Link>
            )}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
  if (inModal) return content;
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        {content}
      </Card>
    </Box>
  );
};

export default Login; 