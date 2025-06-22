import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container, Typography, Box, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination,
    Card, CardContent
} from '@mui/material';
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

function Brokers() {
    const { clusterName } = useParams();
    const [brokers, setBrokers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const fetchBrokers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/clusters/${clusterName}/brokers`);
                setBrokers(response.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBrokers();
    }, [clusterName]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    const paginatedBrokers = brokers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>Brokers</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                {clusterName ? `Cluster: ${clusterName}`: 'Please select a cluster.'}
            </Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent sx={{ p: 0 }}>
                        {brokers.length === 0 ? (
                            <Box textAlign="center" py={6} color="text.secondary">
                                <SentimentDissatisfiedIcon sx={{ fontSize: 64, mb: 2, opacity: 0.6 }} />
                                <Typography variant="h6" sx={{ mb: 1 }}>No brokers found</Typography>
                                <Typography variant="body2">
                                    No brokers available in this cluster.
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer component={Paper} sx={tableStyles.tableContainer}>
                                <Table>
                                    <TableHead sx={tableStyles.tableHead}>
                                        <TableRow>
                                            <TableCell sx={tableStyles.tableCell}>Broker ID</TableCell>
                                            <TableCell sx={tableStyles.tableCell}>Address</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedBrokers.map((broker) => (
                                            <TableRow key={broker.id} sx={tableStyles.tableRow}>
                                                <TableCell sx={{ ...tableStyles.tableCell, fontWeight: 500 }}>
                                                    {broker.id}
                                                </TableCell>
                                                <TableCell sx={tableStyles.tableCell}>
                                                    {broker.addr}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                    {brokers.length > 0 && (
                        <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={brokers.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{
                                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                        fontSize: '0.875rem',
                                    },
                                }}
                            />
                        </Box>
                    )}
                </Card>
            )}
        </Container>
    );
}

export default Brokers; 