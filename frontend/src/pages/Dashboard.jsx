import { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import { getTopics, getConsumerGroups } from '../services/api';

function Dashboard() {
    const [stats, setStats] = useState({
        topics: 0,
        consumerGroups: 0,
        totalMessages: 0,
        activeConsumers: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [topics, consumerGroups] = await Promise.all([
                getTopics(),
                getConsumerGroups(),
            ]);

            setStats({
                topics: topics.length,
                consumerGroups: consumerGroups.length,
                totalMessages: 0, // This would need to be implemented in the backend
                activeConsumers: 0, // This would need to be implemented in the backend
            });
        } catch (error) {
            setError('Failed to fetch dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    const StatCard = ({ label, value, helpText }) => (
        <Paper
            elevation={1}
            sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            <Typography color="text.secondary" gutterBottom>
                {label}
            </Typography>
            <Typography variant="h4" component="div" gutterBottom>
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {helpText}
            </Typography>
        </Paper>
    );

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        label="Total Topics"
                        value={stats.topics}
                        helpText="Active topics in the cluster"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        label="Consumer Groups"
                        value={stats.consumerGroups}
                        helpText="Active consumer groups"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        label="Total Messages"
                        value={stats.totalMessages}
                        helpText="Messages across all topics"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        label="Active Consumers"
                        value={stats.activeConsumers}
                        helpText="Currently active consumers"
                    />
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

export default Dashboard; 