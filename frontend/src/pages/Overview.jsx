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
    Card,
    CardContent,
    CircularProgress,
    Alert,
} from '@mui/material';
import { getTopics, getConsumerGroups, getTopicDetails } from '../services/api';

const Overview = () => {
    const [topics, setTopics] = useState([]);
    const [topicDetails, setTopicDetails] = useState({});
    const [consumerGroups, setConsumerGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Starting to fetch overview data...');
                setLoading(true);
                
                // Fetch topics
                console.log('Fetching topics...');
                const topicsData = await getTopics();
                console.log('Received topics:', topicsData);
                setTopics(topicsData);

                // Fetch details for each topic
                const details = {};
                for (const topicName of topicsData) {
                    try {
                        const details = await getTopicDetails(topicName);
                        console.log(`Topic details for ${topicName}:`, details);
                        setTopicDetails(prev => ({ ...prev, [topicName]: details }));
                    } catch (err) {
                        console.error(`Error fetching details for topic ${topicName}:`, err);
                    }
                }

                // Fetch consumer groups
                console.log('Fetching consumer groups...');
                const consumerGroupsData = await getConsumerGroups();
                console.log('Received consumer groups:', consumerGroupsData);
                setConsumerGroups(consumerGroupsData);

                setError(null);
            } catch (err) {
                console.error('Error fetching overview data:', err);
                setError('Failed to fetch overview data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Log state changes
    useEffect(() => {
        console.log('Topics state updated:', topics);
    }, [topics]);

    useEffect(() => {
        console.log('Consumer groups state updated:', consumerGroups);
    }, [consumerGroups]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    console.log('Rendering Overview with:', { topics, consumerGroups });

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Kafka Overview
            </Typography>

            <Grid container spacing={3}>
                {/* Topics Summary */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Topics ({topics.length})
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Partitions</TableCell>
                                            <TableCell>Replicas</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {topics.map((topicName) => {
                                            const details = topicDetails[topicName] || {};
                                            return (
                                                <TableRow key={topicName}>
                                                    <TableCell>{topicName}</TableCell>
                                                    <TableCell>{details.partitions || 'N/A'}</TableCell>
                                                    <TableCell>{details.replicas || 'N/A'}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Consumer Groups Summary */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Consumer Groups ({consumerGroups.length})
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Group ID</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {consumerGroups.map((groupId) => (
                                            <TableRow key={groupId}>
                                                <TableCell>{groupId}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Partition Distribution */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Partition Distribution
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Topic</TableCell>
                                            <TableCell>Partition</TableCell>
                                            <TableCell>Leader</TableCell>
                                            <TableCell>Replicas</TableCell>
                                            <TableCell>ISR</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {topics.map((topicName) => {
                                            const details = topicDetails[topicName] || {};
                                            const partitions = details.partitions || 0;
                                            return Array.from({ length: partitions }, (_, i) => (
                                                <TableRow key={`${topicName}-partition-${i}`}>
                                                    <TableCell>{topicName}</TableCell>
                                                    <TableCell>{i}</TableCell>
                                                    <TableCell>{details.leader_count || 'N/A'}</TableCell>
                                                    <TableCell>{details.replicas || 'N/A'}</TableCell>
                                                    <TableCell>{details.replicas || 'N/A'}</TableCell>
                                                </TableRow>
                                            ));
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Overview; 