import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getBrokerList, addBroker, removeBroker } from '../../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
  },
}));

const BrokerManager = () => {
  const [brokers, setBrokers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newBroker, setNewBroker] = useState({ host: '', port: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchBrokers();
  }, []);

  const fetchBrokers = async () => {
    try {
      setLoading(true);
      const data = await getBrokerList();
      setBrokers(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching brokers:', err);
      setError('Failed to fetch brokers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBroker = async () => {
    if (!newBroker.host || !newBroker.port) {
      setError('Host and port are required');
      return;
    }

    try {
      setLoading(true);
      await addBroker({
        host: newBroker.host,
        port: parseInt(newBroker.port),
      });
      
      setSuccess('Broker added successfully');
      setNewBroker({ host: '', port: '' });
      setOpenDialog(false);
      fetchBrokers(); // Refresh the list
    } catch (err) {
      console.error('Error adding broker:', err);
      setError(err.response?.data?.error || 'Failed to add broker');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBroker = async (host, port) => {
    try {
      setLoading(true);
      await removeBroker(host, port);
      setSuccess('Broker removed successfully');
      fetchBrokers(); // Refresh the list
    } catch (err) {
      console.error('Error removing broker:', err);
      setError(err.response?.data?.error || 'Failed to remove broker');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewBroker({ host: '', port: '' });
    setError(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Broker Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            },
          }}
        >
          Add Broker
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* Broker List */}
      <Grid container spacing={3}>
        {brokers.map((broker, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {broker.host}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Port: {broker.port}
                    </Typography>
                  </Box>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveBroker(broker.host, broker.port)}
                    disabled={loading}
                    sx={{
                      '&:hover': {
                        background: 'rgba(239, 68, 68, 0.1)',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Chip
                  label="Active"
                  color="success"
                  size="small"
                  sx={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: 'success.main',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                />
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
        
        {brokers.length === 0 && !loading && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No brokers configured
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add your first broker to get started
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Add Broker Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Add New Broker
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Host"
              value={newBroker.host}
              onChange={(e) => setNewBroker({ ...newBroker, host: e.target.value })}
              placeholder="localhost"
              sx={{ mb: 3 }}
              InputProps={{
                sx: {
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Port"
              type="number"
              value={newBroker.port}
              onChange={(e) => setNewBroker({ ...newBroker, port: e.target.value })}
              placeholder="9092"
              InputProps={{
                sx: {
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddBroker}
            variant="contained"
            disabled={loading || !newBroker.host || !newBroker.port}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              },
            }}
          >
            {loading ? 'Adding...' : 'Add Broker'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BrokerManager; 