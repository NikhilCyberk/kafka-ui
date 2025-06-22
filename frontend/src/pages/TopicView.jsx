import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    IconButton,
    Tooltip,
    TextField,
    Button
} from '@mui/material';
import { Refresh as RefreshIcon, PlayArrow as PlayIcon, Stop as StopIcon } from '@mui/icons-material';
import { getTopicDetails, getMessages, produceMessage } from '../services/api';
import MessageProducer from '../components/messages/MessageProducer';

function TopicView() {
    const { topicName } = useParams();
    const [topicDetails, setTopicDetails] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPolling, setIsPolling] = useState(false);
    const [pollingInterval, setPollingInterval] = useState(null);

    useEffect(() => {
        fetchTopicDetails();
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [topicName]);

    const fetchTopicDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const details = await getTopicDetails(topicName);
            setTopicDetails(details);
        } catch (error) {
            console.error('Error fetching topic details:', error);
            setError(error.response?.data?.error || 'Failed to fetch topic details');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const data = await getMessages(topicName);
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError(error.response?.data?.error || 'Failed to fetch messages');
        }
    };

    const togglePolling = () => {
        if (isPolling) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
        } else {
            const interval = setInterval(fetchMessages, 2000); // Poll every 2 seconds
            setPollingInterval(interval);
        }
        setIsPolling(!isPolling);
    };

    // Sort messages by partition and offset before rendering
    const sortedMessages = [...messages].sort((a, b) => {
        if (a.partition !== b.partition) return a.partition - b.partition;
        return a.offset - b.offset;
    });

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">{topicName}</Typography>
                <Box>
                    <Tooltip title={isPolling ? "Stop Polling" : "Start Polling"}>
                        <IconButton onClick={togglePolling} color={isPolling ? "error" : "primary"}>
                            {isPolling ? <StopIcon /> : <PlayIcon />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh">
                        <IconButton onClick={fetchTopicDetails} color="primary">
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

            <Grid container spacing={3}>
                {/* Topic Configuration */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Topic Configuration
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {topicDetails && (
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Partitions: {topicDetails.partitions}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Replication Factor: {topicDetails.replication_factor}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Configs: {Object.entries(topicDetails.configs || {}).map(([key, value]) => (
                                            <Box key={key} sx={{ mt: 1 }}>
                                                <strong>{key}:</strong> {value}
                                            </Box>
                                        ))}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Message Producer */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Produce Message
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <MessageProducer topicName={topicName} onMessageSent={fetchMessages} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Messages Table */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Messages
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Partition</TableCell>
                                            <TableCell>Offset</TableCell>
                                            <TableCell>Key</TableCell>
                                            <TableCell>Value</TableCell>
                                            <TableCell>Timestamp</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedMessages.map((message, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{message.partition}</TableCell>
                                                <TableCell>{message.offset}</TableCell>
                                                <TableCell>{message.key}</TableCell>
                                                <TableCell>
                                                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                                        {typeof message.value === 'object' 
                                                            ? JSON.stringify(message.value, null, 2)
                                                            : message.value}
                                                    </pre>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(message.timestamp).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default TopicView; 