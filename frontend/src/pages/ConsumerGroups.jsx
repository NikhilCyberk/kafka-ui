import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    Snackbar,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import { getConsumerGroups, getConsumerGroupDetails } from '../services/api';

function ConsumerGroups() {
    const [consumerGroups, setConsumerGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchConsumerGroups();
    }, []);

    const fetchConsumerGroups = async () => {
        try {
            const data = await getConsumerGroups();
            setConsumerGroups(data);
        } catch (error) {
            setError('Failed to fetch consumer groups');
        } finally {
            setLoading(false);
        }
    };

    const handleGroupClick = async (groupId) => {
        try {
            const details = await getConsumerGroupDetails(groupId);
            setSelectedGroup(details);
        } catch (error) {
            setError('Failed to fetch consumer group details');
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
            <Typography variant="h4" gutterBottom>
                Consumer Groups
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Group ID</TableCell>
                                    <TableCell>Members</TableCell>
                                    <TableCell>Lag</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {consumerGroups.map((groupId) => (
                                    <TableRow
                                        key={groupId}
                                        onClick={() => handleGroupClick(groupId)}
                                        sx={{
                                            cursor: 'pointer',
                                            '&:hover': { backgroundColor: 'action.hover' }
                                        }}
                                    >
                                        <TableCell>{groupId}</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>-</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                {selectedGroup && (
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {selectedGroup.group_id}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                
                                <Typography variant="subtitle1" gutterBottom>
                                    Topics:
                                </Typography>
                                <List dense>
                                    {selectedGroup.topics.map((topic) => (
                                        <ListItem key={topic}>
                                            <ListItemText primary={topic} />
                                        </ListItem>
                                    ))}
                                </List>
                                
                                <Divider sx={{ my: 2 }} />
                                
                                <Typography variant="body2" color="text.secondary">
                                    Members: {selectedGroup.members}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Lag: {selectedGroup.lag}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
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

export default ConsumerGroups; 