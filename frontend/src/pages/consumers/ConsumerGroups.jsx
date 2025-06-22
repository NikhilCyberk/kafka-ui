import React, { useEffect, useState, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import TextField from '@mui/material/TextField';
import {
    Container, Alert, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
    Grid, InputAdornment, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../services/api';
import { Link as RouterLink } from 'react-router-dom';

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
};

function ConsumerGroups() {
  const { clusterName } = useParams();
  const [consumerGroups, setConsumerGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchConsumerGroups = useCallback(async () => {
    if (!clusterName) return;

      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/clusters/${clusterName}/consumer-groups`);
      setConsumerGroups(response.data || []);
    } catch (error) {
      setError(error.message);
      } finally {
      setLoading(false);
    }
  }, [clusterName]);

  useEffect(() => {
    fetchConsumerGroups();
  }, [fetchConsumerGroups]);

  // Search and pagination logic
  const filteredGroups = (consumerGroups || []).filter(g =>
    (g.group_id || '').toLowerCase().includes(search.toLowerCase())
  );
  const paginatedGroups = filteredGroups.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    setPage(0); // Reset to first page on search
  }, [search]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStateColor = (state) => {
    switch (state?.toLowerCase()) {
      case 'stable':
        return 'success';
      case 'preparing rebalance':
      case 'completing rebalance':
        return 'warning';
      case 'dead':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Grid item>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>Consumer Groups</Typography>
          <Typography color="text.secondary">
            {clusterName ? `Cluster: ${clusterName}`: 'Please select a cluster.'}
          </Typography>
        </Grid>
        <Grid item>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search consumer groups..."
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
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            {paginatedGroups.length === 0 ? (
              <Box textAlign="center" py={6} color="text.secondary">
                <SentimentDissatisfiedIcon sx={{ fontSize: 64, mb: 2, opacity: 0.6 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>No consumer groups found</Typography>
                <Typography variant="body2">
                  {search ? 'No consumer groups match your search criteria.' : 'No consumer groups available in this cluster.'}
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={tableStyles.tableContainer}>
                <Table>
                  <TableHead sx={tableStyles.tableHead}>
                    <TableRow>
                      <TableCell sx={tableStyles.tableCell}>Group ID</TableCell>
                      <TableCell sx={tableStyles.tableCell}>State</TableCell>
                      <TableCell sx={tableStyles.tableCell}>Members</TableCell>
                      <TableCell sx={tableStyles.tableCell}>Topics</TableCell>
                      <TableCell sx={tableStyles.tableCell}>Lag</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedGroups.map((group) => (
                      <TableRow 
                        key={group.group_id}
                        sx={tableStyles.tableRow}
                        onClick={() => navigate(`/dashboard/${clusterName}/consumer-groups/${encodeURIComponent(group.group_id)}`)}
                      >
                        <TableCell sx={{ ...tableStyles.tableCell, cursor: 'pointer', fontWeight: 500 }}>
                          <Link
                            component={RouterLink}
                            to={`/dashboard/${clusterName}/consumer-groups/${encodeURIComponent(group.group_id)}`}
                            sx={{ textDecoration: 'none', fontWeight: 500 }}
                          >
                          {group.group_id}
                          </Link>
                        </TableCell>
                        <TableCell sx={tableStyles.tableCell}>
                          <Chip
                            label={group.state || 'Unknown'}
                            color={getStateColor(group.state)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={tableStyles.tableCell}>
                          {group.num_members}
                        </TableCell>
                        <TableCell sx={tableStyles.tableCell}>
                          {group.num_topics}
                        </TableCell>
                        <TableCell sx={tableStyles.tableCell}>
                          {group.consumer_lag}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredGroups.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{ borderTop: '1px solid', borderColor: 'divider' }}
              />
              </TableContainer>
          )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default ConsumerGroups; 