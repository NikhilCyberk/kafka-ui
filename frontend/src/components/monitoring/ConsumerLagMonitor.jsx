import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Grid,
    LinearProgress
} from '@mui/material';
import { Refresh as RefreshIcon, PlayArrow as PlayIcon, Stop as StopIcon } from '@mui/icons-material';
import { getConsumerGroupDetails } from '../../services/api';

function ConsumerLagMonitor({ groupId }) {
    const [groupDetails, setGroupDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPolling, setIsPolling] = useState(false);
    const [pollingInterval, setPollingInterval] = useState(null);

    useEffect(() => {
        fetchGroupDetails();
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [groupId]);

    const fetchGroupDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const details = await getConsumerGroupDetails(groupId);
            setGroupDetails(details);
        } catch (error) {
            console.error('Error fetching consumer group details:', error);
            setError(error.response?.data?.error || 'Failed to fetch consumer group details');
        } finally {
            setLoading(false);
        }
    };

    const togglePolling = () => {
        if (isPolling) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
        } else {
            const interval = setInterval(fetchGroupDetails, 5000); // Poll every 5 seconds
            setPollingInterval(interval);
        }
        setIsPolling(!isPolling);
    };

    if (loading && !groupDetails) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Consumer Group: {groupId}</Typography>
                <Box>
                    <Tooltip title={isPolling ? "Stop Polling" : "Start Polling"}>
                        <IconButton onClick={togglePolling} color={isPolling ? "error" : "primary"}>
                            {isPolling ? <StopIcon /> : <PlayIcon />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh">
                        <IconButton onClick={fetchGroupDetails} color="primary">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {groupDetails && (
                <Grid container spacing={3}>
                    {/* Summary Cards */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Total Lag
                                </Typography>
                                <Typography variant="h4">
                                    {groupDetails.total_lag || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Active Members
                                </Typography>
                                <Typography variant="h4">
                                    {groupDetails.members || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Status
                                </Typography>
                                <Typography variant="h4" color={groupDetails.state === 'Stable' ? 'success.main' : 'error.main'}>
                                    {groupDetails.state || 'Unknown'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Detailed Lag Table */}
                    <Grid item xs={12}>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Topic</TableCell>
                                        <TableCell>Partition</TableCell>
                                        <TableCell>Current Offset</TableCell>
                                        <TableCell>End Offset</TableCell>
                                        <TableCell>Lag</TableCell>
                                        <TableCell>Progress</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {groupDetails.topics?.map((topic) => (
                                        topic.partitions?.map((partition) => (
                                            <TableRow key={`${topic.name}-${partition.id}`}>
                                                <TableCell>{topic.name}</TableCell>
                                                <TableCell>{partition.id}</TableCell>
                                                <TableCell>{partition.current_offset}</TableCell>
                                                <TableCell>{partition.end_offset}</TableCell>
                                                <TableCell>{partition.lag}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ width: '100%', mr: 1 }}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={((partition.current_offset / partition.end_offset) * 100) || 0}
                                                            color={partition.lag > 1000 ? "error" : "primary"}
                                                        />
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}

export default ConsumerLagMonitor; 