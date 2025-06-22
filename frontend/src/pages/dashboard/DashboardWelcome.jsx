import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useOutletContext } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function DashboardWelcome() {
    const { openClusterManager } = useOutletContext();

    return (
        <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 4, textAlign: 'center' }}>
            <InfoIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight={700}>Welcome to Kafka UI</Typography>
            <Typography color="text.secondary">
                To get started, please add and/or select a cluster from the dropdown menu in the header.
            </Typography>
            <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={openClusterManager}
                sx={{ mt: 2 }}
            >
                Add Your First Cluster
            </Button>
        </Paper>
    );
} 