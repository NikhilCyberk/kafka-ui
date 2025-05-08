
// pages/ConsumerGroupDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    CircularProgress,
    Alert,
    Chip,
    Divider
} from '@mui/material';
import { getConsumerGroupDetails } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ConsumerGroupDetails() {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGroupDetails();
    }, [groupId]);

    const fetchGroupDetails = async () => {
        try {
            setLoading(true);
            const response = await getConsumerGroupDetails(groupId);
            setGroup(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch consumer group details: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Generate mock lag data for visualization
    const generateLagData = () => {
        if (!group || !group.topics) return [];

        return group.topics.map(topic => ({
            topic,
            lag: Math.floor(Math.random() * 1000) // Mock data
        }));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Consumer Group: {groupId}
            </Typography>

            {group && (
                <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">Topics</Typography>
                                    <Typography variant="h4">{group.topics?.length || 0}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">Members</Typography>
                                    <Typography variant="h4">{group.members || 0}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" color="primary">Status</Typography>
                                    <Chip label={group.status} color={group.status === 'Active' ? 'success' : 'error'} size="small" />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Typography variant="h5" gutterBottom>
                        Lag Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={generateLagData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="topic" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="lag" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </>
            )}
        </Box>
    );
}

export default ConsumerGroupDetails;