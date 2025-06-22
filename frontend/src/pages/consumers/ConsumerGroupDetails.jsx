import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useSnackbar } from 'notistack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import api from '../../services/api';

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

function ConsumerGroupDetails() {
  const { clusterName, groupId } = useParams();
  const [tab, setTab] = useState(0);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  const fetchConsumerGroupDetails = useCallback(async () => {
    if (!clusterName || !groupId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/clusters/${clusterName}/consumer-groups/${encodeURIComponent(groupId)}`);
      setDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch consumer group details:', error);
      enqueueSnackbar('Failed to fetch consumer group details', { variant: 'error' });
    } finally {
        setLoading(false);
    }
  }, [clusterName, groupId, enqueueSnackbar]);

  useEffect(() => {
    fetchConsumerGroupDetails();
  }, [fetchConsumerGroupDetails]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (!details) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">Consumer group not found.</Alert>
      </Container>
    );
  }

  const members = Array.isArray(details.members) ? details.members : [];

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Consumer Group: {groupId}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Cluster: {clusterName}
      </Typography>
      
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Members" />
        <Tab label="State" />
        <Tab label="Protocol" />
      </Tabs>
      
      {tab === 0 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Members</Typography>
            </Box>
            {members.length === 0 ? (
              <Box textAlign="center" py={6} color="text.secondary">
                <SentimentDissatisfiedIcon sx={{ fontSize: 64, mb: 2, opacity: 0.6 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>No members found</Typography>
                <Typography variant="body2">
                  No members available in this consumer group.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={tableStyles.tableContainer}>
                <Table>
                  <TableHead sx={tableStyles.tableHead}>
                    <TableRow>
                      <TableCell sx={tableStyles.tableCell}>Client ID</TableCell>
                      <TableCell sx={tableStyles.tableCell}>Host</TableCell>
                      <TableCell sx={tableStyles.tableCell}>Topics</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members.map((m, idx) => (
                      <TableRow key={idx} sx={tableStyles.tableRow}>
                        <TableCell sx={{ ...tableStyles.tableCell, fontWeight: 500 }}>
                          {m.client_id}
                        </TableCell>
                        <TableCell sx={tableStyles.tableCell}>
                          {m.client_host}
                        </TableCell>
                        <TableCell sx={tableStyles.tableCell}>
                          {Array.isArray(m.topics)
                            ? m.topics.join(', ')
                              : 'No topics assigned'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
      
      {tab === 1 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>State</Typography>
            <Box
              sx={{
                display: 'inline-block',
                px: 2,
                py: 1,
                borderRadius: 2,
                backgroundColor: details.state === 'Stable' ? 'success.light' : 'warning.light',
                color: details.state === 'Stable' ? 'success.dark' : 'warning.dark',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '0.875rem',
              }}
            >
              {details.state}
            </Box>
          </CardContent>
        </Card>
      )}
      
      {tab === 2 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Protocol & Type</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Protocol
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {details.protocol}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Protocol Type
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {details.protocol_type}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default ConsumerGroupDetails; 