import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Snackbar,
    CircularProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getTopics, createTopic, deleteTopic } from '../services/api';

function Topics() {
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [newTopic, setNewTopic] = useState({
        name: '',
        partitions: 1,
        replicas: 1
    });

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getTopics();
            setTopics(data);
        } catch (error) {
            console.error('Error fetching topics:', error);
            setError(error.response?.data?.error || 'Failed to fetch topics');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async () => {
        try {
            setError(null);
            await createTopic(newTopic);
            setSuccess('Topic created successfully');
            setOpenCreate(false);
            setNewTopic({ name: '', partitions: 1, replicas: 1 });
            fetchTopics();
        } catch (error) {
            console.error('Error creating topic:', error);
            setError(error.response?.data?.error || 'Failed to create topic');
        }
    };

    const handleDeleteTopic = async () => {
        try {
            setError(null);
            await deleteTopic(selectedTopic);
            setSuccess('Topic deleted successfully');
            setOpenDelete(false);
            setSelectedTopic(null);
            fetchTopics();
        } catch (error) {
            console.error('Error deleting topic:', error);
            setError(error.response?.data?.error || 'Failed to delete topic');
        }
    };

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
                <Typography variant="h4">Topics</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCreate(true)}
                >
                    Create Topic
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {topics.map((topic) => (
                            <TableRow key={topic}>
                                <TableCell>
                                    <Button
                                        color="primary"
                                        onClick={() => navigate(`/topics/${topic}`)}
                                    >
                                        {topic}
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Delete Topic">
                                        <IconButton
                                            color="error"
                                            onClick={() => {
                                                setSelectedTopic(topic);
                                                setOpenDelete(true);
                                            }}
                                            disabled={topic === '__consumer_offsets'}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create Topic Dialog */}
            <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
                <DialogTitle>Create New Topic</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Topic Name"
                            value={newTopic.name}
                            onChange={(e) => setNewTopic(prev => ({ ...prev, name: e.target.value }))}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Partitions"
                            type="number"
                            value={newTopic.partitions}
                            onChange={(e) => setNewTopic(prev => ({ ...prev, partitions: parseInt(e.target.value) || 1 }))}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Replicas"
                            type="number"
                            value={newTopic.replicas}
                            onChange={(e) => setNewTopic(prev => ({ ...prev, replicas: parseInt(e.target.value) || 1 }))}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreateTopic}
                        variant="contained"
                        color="primary"
                        disabled={!newTopic.name}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Topic Dialog */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle>Delete Topic</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete topic "{selectedTopic}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
                    <Button
                        onClick={handleDeleteTopic}
                        variant="contained"
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Error Snackbar */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>

            {/* Success Snackbar */}
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

export default Topics; 