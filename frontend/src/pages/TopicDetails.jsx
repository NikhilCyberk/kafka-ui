import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Alert,
    Snackbar,
} from '@mui/material';
import { getTopicDetails } from '../services/api';
import MessageManager from '../components/messages/MessageManager';

function TopicDetails() {
    const { name } = useParams();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTopicDetails();
    }, [name]);

    const fetchTopicDetails = async () => {
        try {
            const data = await getTopicDetails(name);
            setDetails(data);
        } catch (err) {
            setError('Failed to fetch topic details');
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

    if (error) {
        return (
            <Box p={2}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Topic: {name}
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Topic Details
                        </Typography>
                        <Typography>
                            Partitions: {details?.partitions}
                        </Typography>
                        <Typography>
                            Replicas: {details?.replicas}
                        </Typography>
                        <Typography>
                            Leader Count: {details?.leader_count}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <MessageManager topic={name} />
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

export default TopicDetails; 