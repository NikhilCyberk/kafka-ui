import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  NetworkCheck as NetworkCheckIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import StatCard from '../components/common/StatCard';
import BrokerManager from '../components/brokers/BrokerManager';
import { getBrokerHealth, getBrokerDetails } from '../services/api';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: 16,
  overflow: 'hidden',
  '& .MuiTable-root': {
    '& .MuiTableHead-root .MuiTableRow-root .MuiTableCell-root': {
      background: 'rgba(99, 102, 241, 0.1)',
      color: theme.palette.primary.main,
      fontWeight: 600,
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    '& .MuiTableBody-root .MuiTableRow-root': {
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.02)',
      },
      '& .MuiTableCell-root': {
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        color: theme.palette.text.primary,
      },
    },
  },
}));

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

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTab-root': {
    color: theme.palette.text.secondary,
    fontWeight: 500,
    textTransform: 'none',
    minHeight: 48,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
  },
  '& .MuiTabs-indicator': {
    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    height: 3,
    borderRadius: 2,
  },
}));

const getStatusIcon = (status) => {
  switch (status) {
    case 'healthy':
      return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    case 'warning':
      return <WarningIcon sx={{ color: 'warning.main' }} />;
    case 'critical':
      return <ErrorIcon sx={{ color: 'error.main' }} />;
    default:
      return <CheckCircleIcon sx={{ color: 'success.main' }} />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'healthy':
      return 'success';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'error';
    default:
      return 'success';
  }
};

const Brokers = () => {
  const [brokerHealth, setBrokerHealth] = useState([]);
  const [brokerDetails, setBrokerDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const fetchBrokerData = async () => {
      try {
        setLoading(true);
        
        // Fetch broker health data
        const healthData = await getBrokerHealth();
        setBrokerHealth(healthData || []);

        // Fetch detailed broker information
        const detailsData = await getBrokerDetails();
        setBrokerDetails(detailsData || []);

        setError(null);
      } catch (err) {
        console.error('Error fetching broker data:', err);
        setError('Failed to fetch broker data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBrokerData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        flexDirection="column"
        gap={3}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Loading Broker Information...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Calculate summary statistics
  const totalBrokers = brokerHealth.reduce((sum, item) => sum + item.value, 0);
  const healthyBrokers = brokerHealth.find(item => item.name === 'Healthy')?.value || 0;
  const warningBrokers = brokerHealth.find(item => item.name === 'Warning')?.value || 0;
  const criticalBrokers = brokerHealth.find(item => item.name === 'Critical')?.value || 0;

  const renderOverview = () => (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Brokers"
            value={totalBrokers}
            subtitle="Active brokers in cluster"
            icon={<StorageIcon />}
            color="primary"
            trend="stable"
            trendValue="0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Healthy Brokers"
            value={healthyBrokers}
            subtitle="Fully operational"
            icon={<CheckCircleIcon />}
            color="success"
            trend="up"
            trendValue="+1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Warning Brokers"
            value={warningBrokers}
            subtitle="Requires attention"
            icon={<WarningIcon />}
            color="warning"
            trend="down"
            trendValue="-1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Critical Brokers"
            value={criticalBrokers}
            subtitle="Immediate action needed"
            icon={<ErrorIcon />}
            color="error"
            trend="stable"
            trendValue="0"
          />
        </Grid>
      </Grid>

      {/* Broker Health Distribution */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <StorageIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Broker Health Distribution
                </Typography>
              </Box>
              <StyledTableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>Count</TableCell>
                      <TableCell>Percentage</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {brokerHealth.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(item.name.toLowerCase())}
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{item.value}</TableCell>
                        <TableCell>
                          {totalBrokers > 0 ? ((item.value / totalBrokers) * 100).toFixed(1) : 0}%
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.name === 'Healthy' ? 'Monitor' : 'Investigate'}
                            size="small"
                            color={getStatusColor(item.name.toLowerCase())}
                            sx={{
                              background: `rgba(${getStatusColor(item.name.toLowerCase()) === 'success' ? '16, 185, 129' : getStatusColor(item.name.toLowerCase()) === 'warning' ? '245, 158, 11' : '239, 68, 68'}, 0.1)`,
                              color: theme.palette[getStatusColor(item.name.toLowerCase())].main,
                              border: `1px solid ${theme.palette[getStatusColor(item.name.toLowerCase())].main}30`,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Broker Details */}
        <Grid item xs={12} lg={6}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <NetworkCheckIcon sx={{ mr: 2, color: 'secondary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Broker Details
                </Typography>
              </Box>
              {brokerDetails.length > 0 ? (
                <StyledTableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Broker ID</TableCell>
                        <TableCell>Host</TableCell>
                        <TableCell>Port</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {brokerDetails.map((broker) => (
                        <TableRow key={broker.id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {broker.id}
                            </Typography>
                          </TableCell>
                          <TableCell>{broker.host}</TableCell>
                          <TableCell>{broker.port}</TableCell>
                          <TableCell>
                            <Chip
                              label={broker.status}
                              size="small"
                              color={getStatusColor(broker.status)}
                              sx={{
                                background: `rgba(${getStatusColor(broker.status) === 'success' ? '16, 185, 129' : getStatusColor(broker.status) === 'warning' ? '245, 158, 11' : '239, 68, 68'}, 0.1)`,
                                color: theme.palette[getStatusColor(broker.status)].main,
                                border: `1px solid ${theme.palette[getStatusColor(broker.status)].main}30`,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No detailed broker information available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Additional Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <MemoryIcon sx={{ mr: 2, color: 'info.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Resource Usage
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Resource monitoring coming soon...
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SpeedIcon sx={{ mr: 2, color: 'success.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Performance Metrics
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Performance metrics coming soon...
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Kafka Brokers
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Monitor broker health and performance across your cluster
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <StyledTabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Management" />
        </StyledTabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && renderOverview()}
      {activeTab === 1 && <BrokerManager />}
    </Box>
  );
};

export default Brokers; 