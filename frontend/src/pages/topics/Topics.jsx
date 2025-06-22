import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import {
    Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    TablePagination, Grid, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import DialogContentText from '@mui/material/DialogContentText';
import api from '../../services/api';

const PAGE_SIZE = 10;

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
  actionCell: {
    borderBottom: '1px solid',
    borderColor: 'divider',
    padding: '8px 16px',
    width: '80px',
  },
};

function Topics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { clusterName } = useParams();
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTopics = async () => {
    if (!clusterName) {
      setLoading(false);
      setTopics([]);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/clusters/${clusterName}/topics`);
      setTopics(response.data || []);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
    // eslint-disable-next-line
  }, [clusterName]);

  const handleDeleteClick = (topicName) => {
    setTopicToDelete(topicName);
  };

  const handleDeleteConfirm = async () => {
    if (!topicToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/clusters/${clusterName}/topics/${encodeURIComponent(topicToDelete)}`);
      enqueueSnackbar(`Topic "${topicToDelete}" deleted successfully!`, { variant: 'success' });
      fetchTopics(); // Refresh the list
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || err.message, { variant: 'error' });
    } finally {
      setIsDeleting(false);
      setTopicToDelete(null);
    }
  };

  const filteredTopics = (topics || []).filter(topic =>
    topic.name.toLowerCase().includes(search.toLowerCase())
  );
  const pageCount = Math.ceil(filteredTopics.length / PAGE_SIZE);
  const paginatedTopics = filteredTopics.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1); // Reset to first page on search
  }, [search]);

  return (
    <Container maxWidth="lg">
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Grid item>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>Topics</Typography>
          <Typography color="text.secondary">
            {clusterName ? `Cluster: ${clusterName}`: 'Please select a cluster.'}
          </Typography>
        </Grid>
        <Grid item>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
        </Grid>
      </Grid>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            {paginatedTopics.length === 0 ? (
              <Box textAlign="center" py={6} color="text.secondary">
                <SentimentDissatisfiedIcon sx={{ fontSize: 64, mb: 2, opacity: 0.6 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>No topics found</Typography>
                <Typography variant="body2">
                  {search ? 'No topics match your search criteria.' : 'No topics available in this cluster.'}
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={tableStyles.tableContainer}>
                <Table>
                  <TableHead sx={tableStyles.tableHead}>
                    <TableRow>
                      <TableCell sx={tableStyles.tableCell}>Topic Name</TableCell>
                      <TableCell sx={tableStyles.tableCell}>Partitions</TableCell>
                      <TableCell sx={tableStyles.tableCell}>Replication Factor</TableCell>
                      <TableCell sx={tableStyles.tableCell}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTopics.map((topic) => (
                      <TableRow 
                        key={topic.name}
                        sx={tableStyles.tableRow}
                        onClick={() => navigate(`/dashboard/${clusterName}/topics/${encodeURIComponent(topic.name)}`)}
                      >
                        <TableCell sx={{ ...tableStyles.tableCell, cursor: 'pointer', fontWeight: 500 }}>
                          <Link
                            component={Link}
                            to={`/dashboard/${clusterName}/topics/${encodeURIComponent(topic.name)}`}
                            sx={{ textDecoration: 'none', fontWeight: 500 }}
                          >
                            {topic.name}
                          </Link>
                        </TableCell>
                        <TableCell sx={tableStyles.tableCell}>
                          {topic.partitionCount}
                        </TableCell>
                        <TableCell sx={tableStyles.tableCell}>
                          {topic.replicationFactor}
                        </TableCell>
                        <TableCell sx={tableStyles.actionCell}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(topic.name);
                            }}
                            disabled={isDeleting}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
          {filteredTopics.length > 0 && (
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(e, newPage) => setPage(newPage)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!topicToDelete} onClose={() => setTopicToDelete(null)}>
        <DialogTitle>Delete Topic</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete topic "{topicToDelete}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTopicToDelete(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Topics; 