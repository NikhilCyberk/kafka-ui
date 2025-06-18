import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Tooltip
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { getConsumerGroups } from '../services/api';
import ConsumerLagMonitor from '../components/monitoring/ConsumerLagMonitor';

function ConsumerGroups() {
    const [consumerGroups, setConsumerGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchConsumerGroups();
    }, []);

    const fetchConsumerGroups = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getConsumerGroups();
            setConsumerGroups(data);
        } catch (error) {
            console.error('Error fetching consumer groups:', error);
            setError(error.response?.data?.error || 'Failed to fetch consumer groups');
        } finally {
            setLoading(false);
        }
    };

    const handleGroupClick = (groupId) => {
        setSelectedGroup(groupId);
    };

    if (loading && !consumerGroups.length) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Consumer Groups</Typography>
                <Tooltip title="Refresh">
                    <IconButton onClick={fetchConsumerGroups} color="primary">
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Consumer Groups List */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Groups
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Group ID</TableCell>
                                            <TableCell>Members</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {consumerGroups.map((group) => (
                                            <TableRow
                                                key={group.group_id}
                                                onClick={() => handleGroupClick(group.group_id)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    backgroundColor: selectedGroup === group.group_id ? 'action.selected' : 'inherit',
                                                    '&:hover': { backgroundColor: 'action.hover' }
                                                }}
                                            >
                                                <TableCell>{group.group_id}</TableCell>
                                                <TableCell>{group.members || 0}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Selected Group Details */}
                <Grid item xs={12} md={8}>
                    {selectedGroup ? (
                        <ConsumerLagMonitor groupId={selectedGroup} />
                    ) : (
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="text.secondary" align="center">
                                    Select a consumer group to view details
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}

export default ConsumerGroups; 