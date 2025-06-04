import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getTopics, createTopic } from '../services/api';

function Topics() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [newTopic, setNewTopic] = useState({
        name: '',
        partitions: 1,
        replicas: 1,
    });

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const data = await getTopics();
            console.log('Fetched topics:', data); // Debug log
            if (Array.isArray(data)) {
                setTopics(data);
            } else {
                console.error('Topics data is not an array:', data);
                setTopics([]);
                setError('Invalid topics data received from server');
            }
        } catch (error) {
            console.error('Error fetching topics:', error);
            setError('Failed to fetch topics');
            setTopics([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async () => {
        try {
            await createTopic(newTopic);
            setSuccess('Topic created successfully');
            setOpen(false);
            setNewTopic({ name: '', partitions: 1, replicas: 1 });
            fetchTopics();
        } catch (error) {
            console.error('Error creating topic:', error);
            setError('Failed to create topic');
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
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Topics</Typography>
                <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
                    Create Topic
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Partitions</TableCell>
                            <TableCell>Replicas</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {topics && topics.length > 0 ? (
                            topics.map((topic) => (
                                <TableRow key={topic}>
                                    <TableCell>
                                        <RouterLink to={`/topics/${topic}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            {topic}
                                        </RouterLink>
                                    </TableCell>
                                    <TableCell>-</TableCell>
                                    <TableCell>-</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    No topics found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Create New Topic</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Topic Name"
                        fullWidth
                        value={newTopic.name}
                        onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Number of Partitions"
                        type="number"
                        fullWidth
                        value={newTopic.partitions}
                        onChange={(e) => setNewTopic({ ...newTopic, partitions: parseInt(e.target.value) })}
                        inputProps={{ min: 1 }}
                    />
                    <TextField
                        margin="dense"
                        label="Replication Factor"
                        type="number"
                        fullWidth
                        value={newTopic.replicas}
                        onChange={(e) => setNewTopic({ ...newTopic, replicas: parseInt(e.target.value) })}
                        inputProps={{ min: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateTopic} variant="contained" color="primary">
                        Create
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

export default Topics; 