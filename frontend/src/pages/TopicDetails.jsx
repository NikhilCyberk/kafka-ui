import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Alert,
    Snackbar,
    CircularProgress,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    InputAdornment
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { FilterList, Clear, Search } from '@mui/icons-material';
import { getTopicDetails, getMessages, searchMessages } from '../services/api';
import MessageManager from '../components/messages/MessageManager';
import MessageProducer from '../components/messages/MessageProducer';

function TopicDetails() {
    const { topicName } = useParams();
    const [topicDetails, setTopicDetails] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Message filters
    const [filters, setFilters] = useState({
        key: '',
        value: '',
        startTime: null,
        endTime: null,
        format: 'json'
    });

    useEffect(() => {
        console.log('TopicDetails mounted for topic:', topicName);
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching topic details and messages...');
                
                // Fetch topic details and messages in parallel
                const [details, messagesData] = await Promise.all([
                    getTopicDetails(topicName).catch(err => {
                        console.error('Error fetching topic details:', err);
                        throw err;
                    }),
                    getMessages(topicName, filters).catch(err => {
                        console.error('Error fetching messages:', err);
                        throw err;
                    })
                ]);

                console.log('Topic details received:', details);
                console.log('Messages received:', messagesData);

                setTopicDetails(details);
                setMessages(Array.isArray(messagesData) ? messagesData : []);
            } catch (error) {
                console.error('Error in fetchData:', error);
                setError(error.response?.data?.error || 'Failed to fetch topic data');
                setMessages([]);
            } finally {
                console.log('Setting loading to false');
                setLoading(false);
            }
        };

        fetchData();
    }, [topicName]);

    const handleMessageSent = async () => {
        // Refresh messages after a message is sent
        try {
            const messagesData = await getMessages(topicName, filters);
            setMessages(messagesData || []);
        } catch (error) {
            console.error('Error refreshing messages:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            const messagesData = await getMessages(topicName, filters);
            setMessages(messagesData || []);
            return;
        }

        try {
            setIsSearching(true);
            setError(null);
            const searchParams = {
                query: searchQuery,
                start_time: filters.startTime,
                end_time: filters.endTime,
                format: filters.format
            };
            const data = await searchMessages(topicName, searchParams);
            setMessages(data || []);
        } catch (error) {
            console.error('Error searching messages:', error);
            setError(error.response?.data?.error || 'Failed to search messages');
            setMessages([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApplyFilters = async () => {
        try {
            setLoading(true);
            setError(null);
            const messagesData = await getMessages(topicName, filters);
            setMessages(messagesData || []);
        } catch (error) {
            console.error('Error applying filters:', error);
            setError(error.response?.data?.error || 'Failed to apply filters');
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = async () => {
        setFilters({
            key: '',
            value: '',
            startTime: null,
            endTime: null,
            format: 'json'
        });
        try {
            setLoading(true);
            setError(null);
            const messagesData = await getMessages(topicName, {});
            setMessages(messagesData || []);
        } catch (error) {
            console.error('Error clearing filters:', error);
            setError(error.response?.data?.error || 'Failed to clear filters');
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    // Sort messages by partition and offset before rendering
    const sortedMessages = [...messages].sort((a, b) => {
        if (a.partition !== b.partition) return a.partition - b.partition;
        return a.offset - b.offset;
    });

    if (loading) {
        console.log('Rendering loading state');
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                    Loading topic details...
                </Typography>
            </Box>
        );
    }

    if (error) {
        console.log('Rendering error state:', error);
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Box>
        );
    }

    console.log('Rendering topic details:', topicDetails);
    console.log('Rendering messages:', messages);

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">{topicName}</Typography>
                <Box>
                    <TextField
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        sx={{ mr: 2, width: 300 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleSearch} edge="end">
                                        <Search />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<FilterList />}
                        onClick={() => setShowFilters(!showFilters)}
                        sx={{ mr: 2 }}
                    >
                        Filters
                    </Button>
                </Box>
            </Box>

            {/* Message Producer Component */}
            <MessageProducer 
                topicName={topicName} 
                onMessageSent={handleMessageSent}
            />

            {showFilters && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Key"
                                value={filters.key}
                                onChange={(e) => handleFilterChange('key', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Value"
                                value={filters.value}
                                onChange={(e) => handleFilterChange('value', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateTimePicker
                                    label="Start Time"
                                    value={filters.startTime}
                                    onChange={(date) => handleFilterChange('startTime', date)}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateTimePicker
                                    label="End Time"
                                    value={filters.endTime}
                                    onChange={(date) => handleFilterChange('endTime', date)}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <FormControl fullWidth>
                                <InputLabel>Format</InputLabel>
                                <Select
                                    value={filters.format}
                                    label="Format"
                                    onChange={(e) => handleFilterChange('format', e.target.value)}
                                >
                                    <MenuItem value="json">JSON</MenuItem>
                                    <MenuItem value="string">String</MenuItem>
                                    <MenuItem value="avro">Avro</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Clear />}
                                onClick={handleClearFilters}
                            >
                                Clear Filters
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleApplyFilters}
                            >
                                Apply Filters
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {topicDetails && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle2">Partitions</Typography>
                            <Typography>{topicDetails.partitions}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle2">Replicas</Typography>
                            <Typography>{topicDetails.replicas}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle2">Leader Count</Typography>
                            <Typography>{topicDetails.leader_count}</Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Offset</TableCell>
                            <TableCell>Key</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Partition</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedMessages.map((message) => (
                            <TableRow key={message.offset}>
                                <TableCell>{message.offset}</TableCell>
                                <TableCell>{message.key}</TableCell>
                                <TableCell>
                                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {typeof message.value === 'object' 
                                            ? JSON.stringify(message.value, null, 2)
                                            : message.value}
                                    </pre>
                                </TableCell>
                                <TableCell>{new Date(message.timestamp).toLocaleString()}</TableCell>
                                <TableCell>{message.partition}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess(null)}
            >
                <Alert severity="success" onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default TopicDetails; 