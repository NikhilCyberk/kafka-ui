import { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Snackbar,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { format } from 'date-fns';
import {
    getMessagesPerSecond,
    getLagMetrics,
    getBrokerHealth,
    getPartitionDistribution,
    getTopicMetrics
} from '../../services/api';

const COLORS = ['#4CAF50', '#FFC107', '#F44336'];

function MetricsDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [metrics, setMetrics] = useState({
        messagesPerSecond: [],
        lagMetrics: [],
        brokerHealth: [],
        partitionDistribution: [],
        topicMetrics: []
    });

    const fetchMetrics = async () => {
        try {
            const [
                messagesPerSecond,
                lagMetrics,
                brokerHealth,
                partitionDistribution,
                topicMetrics
            ] = await Promise.all([
                getMessagesPerSecond(),
                getLagMetrics(),
                getBrokerHealth(),
                getPartitionDistribution(),
                getTopicMetrics()
            ]);

            setMetrics({
                messagesPerSecond: messagesPerSecond || [],
                lagMetrics: lagMetrics || [],
                brokerHealth: brokerHealth || [],
                partitionDistribution: partitionDistribution || [],
                topicMetrics: topicMetrics || []
            });
            setError(null);
        } catch (error) {
            console.error('Error fetching metrics:', error);
            setError('Failed to fetch metrics data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Metrics Dashboard
            </Typography>

            <Grid container spacing={3}>
                {/* Messages per Second Chart */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Messages per Second
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={metrics.messagesPerSecond || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="messages"
                                        stroke="#1976d2"
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Lag Metrics Chart */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Consumer Lag
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={metrics.lagMetrics || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="lag"
                                        stroke="#dc004e"
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Broker Health */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Broker Health
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={metrics.brokerHealth || []}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {(metrics.brokerHealth || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Partition Distribution */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Partition Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={metrics.partitionDistribution || []}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {(metrics.partitionDistribution || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Topic Metrics */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Topic Metrics
                            </Typography>
                            <Grid container spacing={2}>
                                {(metrics.topicMetrics || []).map((topic) => (
                                    <Grid item xs={12} sm={4} key={topic.name}>
                                        <Paper sx={{ p: 2 }}>
                                            <Typography variant="subtitle1">{topic.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Size: {(topic.size / 1024).toFixed(2)} MB
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Growth Rate: {topic.growth.toFixed(2)}%
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default MetricsDashboard; 