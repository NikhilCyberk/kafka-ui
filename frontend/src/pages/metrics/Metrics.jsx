import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container, Typography, Box, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Card, CardContent, Tabs, Tab, Grid, Chip, LinearProgress
} from '@mui/material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import StorageIcon from '@mui/icons-material/Storage';
import TopicIcon from '@mui/icons-material/Topic';
import GroupIcon from '@mui/icons-material/Group';
import SpeedIcon from '@mui/icons-material/Speed';
import api from '../../services/api';

// Standardized table styles
const tableStyles = {
  tableContainer: {
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid',
    borderColor: 'divider',
  },
  tableHead: {
    backgroundColor: 'primary.main',
    '& .MuiTableCell-head': {
      color: 'white',
      fontWeight: 600,
      fontSize: '0.875rem',
      borderBottom: '2px solid',
      borderColor: 'primary.dark',
    },
  },
  tableRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: 'action.hover',
    },
    '&:hover': {
      backgroundColor: 'action.selected',
      transition: 'background-color 0.2s ease',
    },
  },
  tableCell: {
    borderBottom: '1px solid',
    borderColor: 'divider',
    padding: '12px 16px',
    fontSize: '0.875rem',
  },
};

function Metrics() {
    const { clusterName } = useParams();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Data states
    const [clusterHealth, setClusterHealth] = useState(null);
    const [brokerMetrics, setBrokerMetrics] = useState([]);
    const [topicMetrics, setTopicMetrics] = useState([]);
    const [consumerGroupMetrics, setConsumerGroupMetrics] = useState([]);
    const [lagData, setLagData] = useState([]);

    useEffect(() => {
        const fetchAllMetrics = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const [
                    healthRes,
                    brokersRes,
                    topicsRes,
                    groupsRes,
                    lagRes
                ] = await Promise.all([
                    api.get(`/clusters/${clusterName}/metrics/cluster-health`),
                    api.get(`/clusters/${clusterName}/metrics/brokers`),
                    api.get(`/clusters/${clusterName}/metrics/topics`),
                    api.get(`/clusters/${clusterName}/metrics/consumer-groups`),
                    api.get(`/clusters/${clusterName}/metrics/consumer-lag`)
                ]);

                setClusterHealth(healthRes.data);
                setBrokerMetrics(Array.isArray(brokersRes.data) ? brokersRes.data : []);
                setTopicMetrics(Array.isArray(topicsRes.data) ? topicsRes.data : []);
                setConsumerGroupMetrics(Array.isArray(groupsRes.data) ? groupsRes.data : []);
                setLagData(Array.isArray(lagRes.data) ? lagRes.data : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (clusterName) {
            fetchAllMetrics();
        }
    }, [clusterName]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const getHealthStatusIcon = (isHealthy) => {
        return isHealthy ? (
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
        ) : (
            <ErrorIcon sx={{ color: 'error.main', fontSize: 20 }} />
        );
    };

    const getHealthStatusChip = (isHealthy) => {
        return (
            <Chip
                icon={getHealthStatusIcon(isHealthy)}
                label={isHealthy ? 'Healthy' : 'Unhealthy'}
                color={isHealthy ? 'success' : 'error'}
                size="small"
                variant="outlined"
            />
        );
    };

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg">
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                Cluster Metrics
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                Cluster: {clusterName}
            </Typography>

            {/* Cluster Health Overview */}
            {clusterHealth && (
                <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Cluster Health Overview
                            </Typography>
                            <Box sx={{ ml: 'auto' }}>
                                {getHealthStatusChip(clusterHealth.is_healthy)}
                            </Box>
                        </Box>
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                                        {clusterHealth.total_brokers}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Brokers
                                    </Typography>
                                    <Typography variant="caption" color="success.main">
                                        {clusterHealth.online_brokers} online
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                                        {clusterHealth.total_topics}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Topics
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                                        {clusterHealth.total_partitions}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Partitions
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                                        {clusterHealth.controller_id}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Controller ID
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Health Issues */}
                        {(clusterHealth.under_replicated > 0 || clusterHealth.offline_replicas > 0) && (
                            <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="warning.dark" sx={{ mb: 1 }}>
                                    <WarningIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                    Health Issues Detected
                                </Typography>
                                {clusterHealth.under_replicated > 0 && (
                                    <Typography variant="body2" color="warning.dark">
                                        {clusterHealth.under_replicated} under-replicated partitions
                                    </Typography>
                                )}
                                {clusterHealth.offline_replicas > 0 && (
                                    <Typography variant="body2" color="warning.dark">
                                        {clusterHealth.offline_replicas} offline replicas
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Metrics Tabs */}
            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Consumer Lag" icon={<SpeedIcon />} iconPosition="start" />
                    <Tab label="Brokers" icon={<StorageIcon />} iconPosition="start" />
                    <Tab label="Topics" icon={<TopicIcon />} iconPosition="start" />
                    <Tab label="Consumer Groups" icon={<GroupIcon />} iconPosition="start" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    {activeTab === 0 && (
                        <ConsumerLagTab lagData={lagData} />
                    )}
                    {activeTab === 1 && (
                        <BrokersTab brokerMetrics={brokerMetrics} />
                    )}
                    {activeTab === 2 && (
                        <TopicsTab topicMetrics={topicMetrics} />
                    )}
                    {activeTab === 3 && (
                        <ConsumerGroupsTab consumerGroupMetrics={consumerGroupMetrics} />
                    )}
                </Box>
            </Card>
        </Container>
    );
}

// Consumer Lag Tab Component
function ConsumerLagTab({ lagData }) {
    if (!lagData || lagData.length === 0) {
        return (
            <Box textAlign="center" py={6} color="text.secondary">
                <SentimentDissatisfiedIcon sx={{ fontSize: 64, mb: 2, opacity: 0.6 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>No lag data found</Typography>
                <Typography variant="body2">No consumer group lag data available for this cluster.</Typography>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} sx={tableStyles.tableContainer}>
            <Table>
                <TableHead sx={tableStyles.tableHead}>
                    <TableRow>
                        <TableCell sx={tableStyles.tableCell}>Group ID</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Topic</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Total Lag</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {lagData.map((lag, index) => (
                        <TableRow key={index} sx={tableStyles.tableRow}>
                            <TableCell sx={{ ...tableStyles.tableCell, fontWeight: 500 }}>{lag.group_id}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>{lag.topic}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>{lag.total_lag}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

// Brokers Tab Component
function BrokersTab({ brokerMetrics }) {
    if (!brokerMetrics || brokerMetrics.length === 0) {
        return (
            <Box textAlign="center" py={6} color="text.secondary">
                <SentimentDissatisfiedIcon sx={{ fontSize: 64, mb: 2, opacity: 0.6 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>No broker data</Typography>
                <Typography variant="body2">No broker metrics available for this cluster.</Typography>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} sx={tableStyles.tableContainer}>
            <Table>
                <TableHead sx={tableStyles.tableHead}>
                    <TableRow>
                        <TableCell sx={tableStyles.tableCell}>ID</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Host</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Port</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Controller</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Status</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Leaders</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Replicas</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Offline Replicas</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {brokerMetrics.map((broker) => (
                        <TableRow key={broker.id} sx={tableStyles.tableRow}>
                            <TableCell sx={{ ...tableStyles.tableCell, fontWeight: 500 }}>{broker.id}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>{broker.host}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>{broker.port}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>
                                {broker.is_controller ? 'Yes' : 'No'}
                            </TableCell>
                            <TableCell sx={tableStyles.tableCell}>
                                <Chip
                                    label={broker.is_online ? 'Online' : 'Offline'}
                                    color={broker.is_online ? 'success' : 'error'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell sx={tableStyles.tableCell}>{broker.leader_count}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>{broker.replica_count}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>{broker.offline_replicas}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

// Topics Tab Component
function TopicsTab({ topicMetrics }) {
    if (!topicMetrics || topicMetrics.length === 0) {
        return (
            <Box textAlign="center" py={6} color="text.secondary">
                <SentimentDissatisfiedIcon sx={{ fontSize: 64, mb: 2, opacity: 0.6 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>No topic data</Typography>
                <Typography variant="body2">No topic metrics available for this cluster.</Typography>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} sx={tableStyles.tableContainer}>
            <Table>
                <TableHead sx={tableStyles.tableHead}>
                    <TableRow>
                        <TableCell sx={tableStyles.tableCell}>Topic Name</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Partitions</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Replicas</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Total Messages</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Avg. Message Size</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Under-replicated</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {topicMetrics.map((topic) => (
                        <TableRow key={topic.name} sx={tableStyles.tableRow}>
                            <TableCell sx={{ ...tableStyles.tableCell, fontWeight: 500 }}>{topic.name}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>{topic.partition_count}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>{topic.replica_count}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>{(topic.total_messages || 0).toLocaleString()}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>{(topic.avg_message_size || 0).toLocaleString()} bytes</TableCell>
                            <TableCell sx={tableStyles.tableCell}>{topic.under_replicated}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

// Consumer Groups Tab Component
function ConsumerGroupsTab({ consumerGroupMetrics }) {
    if (!consumerGroupMetrics || consumerGroupMetrics.length === 0) {
        return (
            <Box textAlign="center" py={6} color="text.secondary">
                <SentimentDissatisfiedIcon sx={{ fontSize: 64, mb: 2, opacity: 0.6 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>No consumer group data</Typography>
                <Typography variant="body2">No consumer group metrics available for this cluster.</Typography>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} sx={tableStyles.tableContainer}>
            <Table>
                <TableHead sx={tableStyles.tableHead}>
                    <TableRow>
                        <TableCell sx={tableStyles.tableCell}>Group ID</TableCell>
                        <TableCell sx={tableStyles.tableCell}>State</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Members</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Topics</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Total Lag</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Avg. Lag</TableCell>
                        <TableCell sx={tableStyles.tableCell}>Max Lag</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {consumerGroupMetrics.map((group) => (
                        <TableRow key={group.group_id} sx={tableStyles.tableRow}>
                            <TableCell sx={{ ...tableStyles.tableCell, fontWeight: 500 }}>{group.group_id}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>
                                <Chip
                                    label={group.is_stable ? 'Stable' : 'Unstable'}
                                    color={group.is_stable ? 'success' : 'warning'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell sx={tableStyles.tableCell}>{group.member_count}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>{group.topic_count}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>{(group.total_lag || 0).toLocaleString()}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>{(group.avg_lag || 0).toLocaleString()}</TableCell>
                            <TableCell sx={tableStyles.tableCell}>{(group.max_lag || 0).toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default Metrics;