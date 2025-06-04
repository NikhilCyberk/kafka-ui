import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    IconButton,
    Tooltip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import { getMessages, replayMessages, validateMessage } from '../../services/api';

const MessageFormat = {
    JSON: 'json',
    AVRO: 'avro',
    PROTOBUF: 'protobuf',
};

function MessageManager({ topic }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [filters, setFilters] = useState({
        key: '',
        value: '',
        startTime: null,
        endTime: null,
        format: '',
    });
    const [replayDialogOpen, setReplayDialogOpen] = useState(false);
    const [replayRange, setReplayRange] = useState({
        startOffset: '',
        endOffset: '',
    });

    useEffect(() => {
        fetchMessages();
    }, [topic]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const data = await getMessages(topic, filters);
            setMessages(data);
        } catch (err) {
            setError('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleReplay = async () => {
        try {
            await replayMessages(topic, replayRange.startOffset, replayRange.endOffset);
            setSuccess('Messages replayed successfully');
            setReplayDialogOpen(false);
            fetchMessages();
        } catch (err) {
            setError('Failed to replay messages');
        }
    };

    const handleValidate = async (message) => {
        try {
            await validateMessage(message);
            setSuccess('Message is valid');
        } catch (err) {
            setError('Message validation failed');
        }
    };

    return (
        <Box>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Message Filters
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Key"
                            value={filters.key}
                            onChange={(e) => handleFilterChange('key', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Value"
                            value={filters.value}
                            onChange={(e) => handleFilterChange('value', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                                label="Start Time"
                                value={filters.startTime}
                                onChange={(date) => handleFilterChange('startTime', date)}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                                label="End Time"
                                value={filters.endTime}
                                onChange={(date) => handleFilterChange('endTime', date)}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Format</InputLabel>
                            <Select
                                value={filters.format}
                                label="Format"
                                onChange={(e) => handleFilterChange('format', e.target.value)}
                            >
                                <MenuItem value="">Any</MenuItem>
                                <MenuItem value={MessageFormat.JSON}>JSON</MenuItem>
                                <MenuItem value={MessageFormat.AVRO}>Avro</MenuItem>
                                <MenuItem value={MessageFormat.PROTOBUF}>Protobuf</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        onClick={fetchMessages}
                    >
                        Search
                    </Button>
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Offset</TableCell>
                            <TableCell>Key</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Format</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {messages.map((message) => (
                            <TableRow key={message.offset}>
                                <TableCell>{message.offset}</TableCell>
                                <TableCell>{message.key}</TableCell>
                                <TableCell>
                                    {typeof message.value === 'object'
                                        ? JSON.stringify(message.value, null, 2)
                                        : message.value}
                                </TableCell>
                                <TableCell>
                                    {new Date(message.timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell>{message.format}</TableCell>
                                <TableCell>
                                    <Tooltip title="Validate Message">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleValidate(message)}
                                        >
                                            <SearchIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={replayDialogOpen} onClose={() => setReplayDialogOpen(false)}>
                <DialogTitle>Replay Messages</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Start Offset"
                        type="number"
                        fullWidth
                        value={replayRange.startOffset}
                        onChange={(e) => setReplayRange(prev => ({
                            ...prev,
                            startOffset: e.target.value
                        }))}
                    />
                    <TextField
                        margin="dense"
                        label="End Offset"
                        type="number"
                        fullWidth
                        value={replayRange.endOffset}
                        onChange={(e) => setReplayRange(prev => ({
                            ...prev,
                            endOffset: e.target.value
                        }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReplayDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleReplay} variant="contained">
                        Replay
                    </Button>
                </DialogActions>
            </Dialog>

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

export default MessageManager; 