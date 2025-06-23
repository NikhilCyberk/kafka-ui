import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Card, CardContent, List, ListItem, ListItemText,
    TextField, Button, Select, MenuItem, FormControl, InputLabel, TablePagination, InputAdornment, TableSortLabel,
    Tab, Tabs, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Chip, Tooltip
} from '@mui/material';
import { useSnackbar } from 'notistack';
import SearchIcon from '@mui/icons-material/Search';
import { Clear } from '@mui/icons-material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { FaPlus, FaTrash, FaEye } from 'react-icons/fa';
import api from '../../services/api';
import { useTheme } from '@mui/material/styles';

// Standardized table styles
const tableStyles = {
  tableContainer: {
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid',
    borderColor: 'divider',
  },
  tableHead: {
    backgroundColor: 'primary.main',
    '& .MuiTableCell-head': {
      color: 'white',
      fontWeight: 600,
      fontSize: '0.875rem',
      borderBottom: '2px solid',
      borderColor: 'primary.dark',
    },
  },
  tableRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: 'action.hover',
    },
    '&:hover': {
      backgroundColor: 'action.selected',
      transition: 'background-color 0.2s ease',
    },
  },
  tableCell: {
    borderBottom: '1px solid',
    borderColor: 'divider',
    padding: '12px 16px',
    fontSize: '0.875rem',
  },
  configTableRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: 'action.hover',
    },
  },
  configTableCell: {
    borderBottom: '1px solid',
    borderColor: 'divider',
    padding: '12px 16px',
    fontSize: '0.875rem',
  },
};

function TopicDetails() {
    const { clusterName, topicName } = useParams();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [produceDialogOpen, setProduceDialogOpen] = useState(false);
    const [newMessage, setNewMessage] = useState({ key: '', value: '', partition: '' });
    const [selectedMessage, setSelectedMessage] = useState(null);
    const theme = useTheme();

    const fetchTopicDetails = useCallback(async () => {
        if (!clusterName || !topicName) return;
        
        setLoading(true);
        setError(null);
        try {
            const response = await api.topic.getTopicDetails(clusterName, topicName);
            setDetails(response.data);
        } catch (error) {
            console.error('Failed to fetch topic details:', error);
            enqueueSnackbar('Failed to fetch topic details', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [clusterName, topicName, enqueueSnackbar]);

    const fetchMessages = useCallback(async () => {
        if (!clusterName || !topicName) return;
        
        setMessagesLoading(true);
        try {
            const response = await api.message.getMessages(clusterName, topicName, { limit: 50 });
            setMessages(response.data || []);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            enqueueSnackbar('Failed to fetch messages', { variant: 'error' });
        } finally {
            setMessagesLoading(false);
        }
    }, [clusterName, topicName, enqueueSnackbar]);

    useEffect(() => {
        fetchTopicDetails();
    }, [fetchTopicDetails]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleDeleteTopic = async () => {
        if (!window.confirm(`Are you sure you want to delete topic "${topicName}"?`)) {
            return;
        }

        try {
            await api.topic.deleteTopic(clusterName, topicName);
            enqueueSnackbar('Topic deleted successfully!', { variant: 'success' });
            navigate(`/dashboard/${clusterName}/topics`);
        } catch (error) {
            console.error('Failed to delete topic:', error);
            enqueueSnackbar('Failed to delete topic', { variant: 'error' });
        }
        setDeleteDialogOpen(false);
    };

    const handleProduceMessage = async () => {
        try {
            let partition = undefined;
            if (newMessage.partition !== "") {
                partition = Number(newMessage.partition);
            }
            await api.message.produceMessage(clusterName, topicName, {
                key: newMessage.key,
                value: newMessage.value,
                partition
            });
            enqueueSnackbar('Message produced successfully!', { variant: 'success' });
            setProduceDialogOpen(false);
            setNewMessage({ key: '', value: '', partition: '' });
            fetchMessages(); // Refresh messages
        } catch (error) {
            console.error('Failed to produce message:', error);
            enqueueSnackbar('Failed to produce message', { variant: 'error' });
        }
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 4 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <CardContent>
                    <Grid
                        container
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 2 }}
                    >
                        <Grid item>
                            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                                Topic: {topicName}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Box>
                                <Button
                                    variant="contained"
                                    startIcon={<FaPlus />}
                                    onClick={() => setProduceDialogOpen(true)}
                                    sx={{ mr: 1 }}
                                >
                                    Produce Message
                                </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                    startIcon={<FaTrash />}
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                Delete Topic
                            </Button>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={tabValue} onChange={handleTabChange}>
                            <Tab label="Partitions" />
                            <Tab label="Configuration" />
                            <Tab label="Messages" />
                        </Tabs>
                    </Box>

                    {tabValue === 0 && <PartitionsTab partitions={details?.partitions || []} />}
                    {tabValue === 1 && <ConfigsTab configs={details?.configs || {}} />}
                    {tabValue === 2 && <MessagesTab messages={messages} messagesLoading={messagesLoading} fetchMessages={fetchMessages} onShowFullMessage={setSelectedMessage} />}
                </CardContent>
            </Card>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Topic</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the topic "{topicName}"? This
                        action is irreversible.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteTopic} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={produceDialogOpen} onClose={() => setProduceDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Produce Message</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Key"
                        value={newMessage.key}
                        onChange={(e) => setNewMessage({ ...newMessage, key: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Value"
                        value={newMessage.value}
                        onChange={(e) => setNewMessage({ ...newMessage, value: e.target.value })}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="partition-select-label">Partition (optional)</InputLabel>
                        <Select
                            labelId="partition-select-label"
                            value={newMessage.partition}
                            label="Partition (optional)"
                            onChange={(e) => setNewMessage({ ...newMessage, partition: e.target.value })}
                        >
                            <MenuItem value="">Auto (Round-Robin)</MenuItem>
                            {details?.partitions?.map((p) => (
                                <MenuItem key={p.id} value={p.id}>{p.id}</MenuItem>
                            ))}
                        </Select>
                        <Typography variant="caption" color="text.secondary">
                            Leave empty for automatic partition assignment
                        </Typography>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setProduceDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleProduceMessage} variant="contained">
                        Produce
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!selectedMessage} onClose={() => setSelectedMessage(null)} maxWidth="md" fullWidth>
                <DialogTitle>Full Message Value</DialogTitle>
                <DialogContent>
                    <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '1rem' }}>
                        {selectedMessage}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedMessage(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

function PartitionsTab({ partitions }) {
    return (
        <Box>
            {partitions.length === 0 ? (
                <Box textAlign="center" py={6} color="text.secondary">
                    <SentimentDissatisfiedIcon sx={{ fontSize: 64, mb: 2, opacity: 0.6 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>No partitions found</Typography>
                    <Typography variant="body2">
                        No partitions available for this topic.
                    </Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} sx={tableStyles.tableContainer}>
                    <Table>
                        <TableHead sx={tableStyles.tableHead}>
                            <TableRow>
                                <TableCell sx={tableStyles.tableCell}>ID</TableCell>
                                <TableCell sx={tableStyles.tableCell}>Leader</TableCell>
                                <TableCell sx={tableStyles.tableCell}>Replicas</TableCell>
                                <TableCell sx={tableStyles.tableCell}>In-Sync Replicas (ISR)</TableCell>
                                <TableCell sx={tableStyles.tableCell}>Offline Replicas</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {partitions.map((p) => (
                                <TableRow key={p.id} sx={tableStyles.tableRow}>
                                    <TableCell sx={{ ...tableStyles.tableCell, fontWeight: 500 }}>
                                        {p.id}
                                    </TableCell>
                                    <TableCell sx={tableStyles.tableCell}>{p.leader}</TableCell>
                                    <TableCell sx={tableStyles.tableCell}>{p.replicas.join(", ")}</TableCell>
                                    <TableCell sx={tableStyles.tableCell}>{p.isr.join(", ")}</TableCell>
                                    <TableCell sx={tableStyles.tableCell}>
                                        {p.offlineReplicas.length > 0 ? p.offlineReplicas.join(", ") : "None"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

function ConfigsTab({ configs }) {
    const configEntries = Object.entries(configs);
    const theme = useTheme();
    return (
        <Box>
            {configEntries.length === 0 ? (
                <Box textAlign="center" py={6} color="text.secondary">
                    <SentimentDissatisfiedIcon sx={{ fontSize: 64, mb: 2, opacity: 0.6 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>No configuration found</Typography>
                    <Typography variant="body2">
                        No configuration available for this topic.
                    </Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} sx={tableStyles.tableContainer}>
                    <Table>
                        <TableHead sx={tableStyles.tableHead}>
                            <TableRow>
                                <TableCell sx={tableStyles.tableCell}>Configuration Key</TableCell>
                                <TableCell sx={tableStyles.tableCell}>Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {configEntries.map(([key, value]) => (
                                <TableRow key={key} sx={tableStyles.configTableRow}>
                                    <TableCell
                                        sx={{
                                            ...tableStyles.configTableCell,
                                            fontWeight: 600,
                                            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[50],
                                            color: theme.palette.text.primary,
                                        }}
                                    >
                                        {key}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            ...tableStyles.configTableCell,
                                            color: theme.palette.text.primary,
                                            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : undefined,
                                        }}
                                    >
                                        {value}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

function MessagesTab({ messages, messagesLoading, fetchMessages, onShowFullMessage }) {
    const { enqueueSnackbar } = useSnackbar();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const theme = useTheme();

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const filteredMessages =
        messages?.filter(
            (msg) =>
                msg.key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.value?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];

    if (messagesLoading && messages.length === 0) {
        return <Alert severity="info">Loading messages...</Alert>;
    }

    if (filteredMessages.length === 0 && !messagesLoading) {
        return <Alert severity="info">No messages found</Alert>;
    }

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    gap: 2,
                }}
            >
                <TextField
                    label="Search Messages"
                    variant="outlined"
                    size="small"
                    sx={{ flexGrow: 1 }}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setSearchTerm("")} edge="end">
                                    {searchTerm ? <Clear /> : <SearchIcon />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    variant="contained"
                    onClick={fetchMessages}
                    disabled={messagesLoading}
                    startIcon={messagesLoading ? <CircularProgress size={20} /> : null}
                >
                    Refresh
                </Button>
            </Box>
            
            {filteredMessages.length === 0 && messagesLoading ? (
                <Alert severity="info">Loading messages...</Alert>
            ) : (
                <TableContainer component={Paper} sx={tableStyles.tableContainer}>
                    <Table>
                        <TableHead sx={tableStyles.tableHead}>
                            <TableRow>
                                <TableCell sx={tableStyles.tableCell}>Partition</TableCell>
                                <TableCell sx={tableStyles.tableCell}>Offset</TableCell>
                                <TableCell sx={tableStyles.tableCell}>Timestamp</TableCell>
                                <TableCell sx={tableStyles.tableCell}>Key</TableCell>
                                <TableCell sx={tableStyles.tableCell}>Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredMessages
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((msg, index) => (
                                        <TableRow
                                            key={`${msg.partition}-${msg.offset}-${index}`}
                                            sx={tableStyles.tableRow}
                                        >
                                            <TableCell sx={{ ...tableStyles.tableCell, fontWeight: 500 }}>
                                                {msg.partition}
                                            </TableCell>
                                            <TableCell sx={tableStyles.tableCell}>{msg.offset}</TableCell>
                                            <TableCell sx={tableStyles.tableCell}>
                                                {new Date(msg.time).toLocaleString()}
                                            </TableCell>
                                            <TableCell sx={tableStyles.tableCell}>
                                                <Box
                                                    component="pre"
                                                    sx={{
                                                        margin: 0,
                                                        fontSize: '0.75rem',
                                                        fontFamily: 'monospace',
                                                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[100],
                                                        color: theme.palette.text.primary,
                                                        padding: 1,
                                                        borderRadius: 1,
                                                        maxWidth: 200,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {msg.key}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={tableStyles.tableCell}>
                                                <Box
                                                    component="pre"
                                                    sx={{
                                                        margin: 0,
                                                        fontSize: '0.75rem',
                                                        fontFamily: 'monospace',
                                                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[100],
                                                        color: theme.palette.text.primary,
                                                        padding: 1,
                                                        borderRadius: 1,
                                                        maxWidth: 300,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.2s',
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.action.hover,
                                                        },
                                                    }}
                                                    onClick={() => onShowFullMessage(msg.value)}
                                                    title="Click to view full message"
                                                >
                                                    {msg.value}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                    {filteredMessages.length > 0 && (
                        <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                component="div"
                                count={filteredMessages.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={(e, newPage) => setPage(newPage)}
                                onRowsPerPageChange={(e) => {
                                    setRowsPerPage(parseInt(e.target.value, 10));
                                    setPage(0);
                                }}
                                sx={{
                                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                        fontSize: '0.875rem',
                                    },
                                }}
                            />
                        </Box>
                    )}
                </TableContainer>
            )}
        </Box>
    );
}

export default TopicDetails;