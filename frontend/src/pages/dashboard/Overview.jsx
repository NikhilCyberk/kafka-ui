import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, CircularProgress, Paper } from '@mui/material';
import { FaServer, FaListAlt, FaUsers } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

function StatCard({ icon, title, value, loading }) {
    return (
        <Paper sx={{ display: 'flex', alignItems: 'center', p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ mr: 2, color: 'primary.main' }}>
                {React.cloneElement(icon, { size: 36 })}
            </Box>
            <Box>
                <Typography variant="body1" color="text.secondary">{title}</Typography>
                {loading ? <CircularProgress size={28} sx={{mt: 0.5}}/> : <Typography variant="h4" fontWeight={700}>{value}</Typography>}
            </Box>
        </Paper>
    );
}

export default function Overview() {
    const [stats, setStats] = useState({ brokers: 0, topics: 0, consumerGroups: 0 });
    const [loading, setLoading] = useState(true);
    const { clusterName } = useParams();

    useEffect(() => {
        if (!clusterName) return;

        async function fetchData() {
            setLoading(true);
            try {
                const [brokersRes, topicsRes, consumersRes] = await Promise.all([
                    api.get(`/clusters/${clusterName}/brokers`),
                    api.get(`/clusters/${clusterName}/topics`),
                    api.get(`/clusters/${clusterName}/consumer-groups`)
                ]);
                setStats({
                    brokers: brokersRes.data?.length || 0,
                    topics: topicsRes.data?.length || 0,
                    consumerGroups: consumersRes.data?.length || 0,
                });
            } catch (error) {
                console.error("Error fetching overview stats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [clusterName]);

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight={700}>
                Cluster Overview
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <StatCard
                        icon={<FaServer />}
                        title="Brokers"
                        value={stats.brokers}
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        icon={<FaListAlt />}
                        title="Topics"
                        value={stats.topics}
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        icon={<FaUsers />}
                        title="Consumer Groups"
                        value={stats.consumerGroups}
                        loading={loading}
                    />
                </Grid>
            </Grid>
        </Box>
    );
} 