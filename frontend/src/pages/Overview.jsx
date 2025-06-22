import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    useTheme,
} from '@mui/material';
import {
    Topic as TopicIcon,
    Group as GroupIcon,
    Storage as StorageIcon,
    Speed as SpeedIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import StatCard from '../components/common/StatCard';
import { getTopics, getConsumerGroups, getTopicDetails } from '../services/api';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    '& .MuiTable-root': {
        '& .MuiTableHead-root .MuiTableRow-root .MuiTableCell-root': {
            background: 'rgba(99, 102, 241, 0.1)',
            color: theme.palette.primary.main,
            fontWeight: 600,
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        },
        '& .MuiTableBody-root .MuiTableRow-root': {
            '&:hover': {
                background: 'rgba(255, 255, 255, 0.02)',
            },
            '& .MuiTableCell-root': {
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                color: theme.palette.text.primary,
            },
        },
    },
}));

const StyledCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
    },
}));

const Overview = () => {
    const [topics, setTopics] = useState([]);
    const [topicDetails, setTopicDetails] = useState({});
    const [consumerGroups, setConsumerGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Starting to fetch overview data...');
                setLoading(true);
                
                // Fetch topics
                console.log('Fetching topics...');
                const topicsData = await getTopics();
                console.log('Received topics:', topicsData);
                setTopics(topicsData);

                // Fetch details for each topic
                const details = {};
                for (const topicName of topicsData) {
                    try {
                        const details = await getTopicDetails(topicName);
                        console.log(`Topic details for ${topicName}:`, details);
                        setTopicDetails(prev => ({ ...prev, [topicName]: details }));
                    } catch (err) {
                        console.error(`Error fetching details for topic ${topicName}:`, err);
                    }
                }

                // Fetch consumer groups
                console.log('Fetching consumer groups...');
                const consumerGroupsData = await getConsumerGroups();
                console.log('Received consumer groups:', consumerGroupsData);
                setConsumerGroups(consumerGroupsData);

                setError(null);
            } catch (err) {
                console.error('Error fetching overview data:', err);
                setError('Failed to fetch overview data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="60vh"
                flexDirection="column"
                gap={3}
            >
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" color="text.secondary">
                    Loading Kafka Overview...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert 
                    severity="error" 
                    sx={{ 
                        borderRadius: 3,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                >
                    {error}
                </Alert>
            </Box>
        );
    }

    // Calculate summary statistics
    const totalPartitions = Object.values(topicDetails).reduce((sum, details) => {
        return sum + (details.partitions || 0);
    }, 0);

    const totalReplicas = Object.values(topicDetails).reduce((sum, details) => {
        return sum + (details.replicas || 0);
    }, 0);

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography 
                    variant="h3" 
                    sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1,
                    }}
                >
                    Kafka Overview
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Monitor your Kafka cluster health and performance
                </Typography>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Topics"
                        value={topics.length}
                        subtitle="Active topics in cluster"
                        icon={<TopicIcon />}
                        color="primary"
                        trend="up"
                        trendValue="+2"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Consumer Groups"
                        value={consumerGroups.length}
                        subtitle="Active consumer groups"
                        icon={<GroupIcon />}
                        color="secondary"
                        trend="up"
                        trendValue="+1"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Partitions"
                        value={totalPartitions}
                        subtitle="Across all topics"
                        icon={<StorageIcon />}
                        color="info"
                        trend="up"
                        trendValue="+5"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Replicas"
                        value={totalReplicas}
                        subtitle="Data replication factor"
                        icon={<SpeedIcon />}
                        color="success"
                        trend="stable"
                        trendValue="0"
                    />
                </Grid>
            </Grid>

            {/* Topics and Consumer Groups */}
            <Grid container spacing={3}>
                {/* Topics Summary */}
                <Grid item xs={12} lg={6}>
                    <StyledCard>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <TopicIcon sx={{ mr: 2, color: 'primary.main' }} />
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    Topics ({topics.length})
                                </Typography>
                            </Box>
                            <StyledTableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Partitions</TableCell>
                                            <TableCell>Replicas</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {topics.map((topicName) => {
                                            const details = topicDetails[topicName] || {};
                                            return (
                                                <TableRow key={topicName}>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {topicName}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>{details.partitions || 'N/A'}</TableCell>
                                                    <TableCell>{details.replicas || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label="Active"
                                                            size="small"
                                                            color="success"
                                                            sx={{
                                                                background: 'rgba(16, 185, 129, 0.1)',
                                                                color: 'success.main',
                                                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </StyledTableContainer>
                        </CardContent>
                    </StyledCard>
                </Grid>

                {/* Consumer Groups Summary */}
                <Grid item xs={12} lg={6}>
                    <StyledCard>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <GroupIcon sx={{ mr: 2, color: 'secondary.main' }} />
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    Consumer Groups ({consumerGroups.length})
                                </Typography>
                            </Box>
                            <StyledTableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Group ID</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Members</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {consumerGroups.map((groupId) => (
                                            <TableRow key={groupId}>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {groupId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label="Active"
                                                        size="small"
                                                        color="success"
                                                        sx={{
                                                            background: 'rgba(16, 185, 129, 0.1)',
                                                            color: 'success.main',
                                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>N/A</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </StyledTableContainer>
                        </CardContent>
                    </StyledCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Overview; 