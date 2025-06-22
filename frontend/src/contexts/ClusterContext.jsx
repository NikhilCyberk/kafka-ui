import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ClusterContext = createContext();

export const useCluster = () => {
  const context = useContext(ClusterContext);
  if (!context) {
    throw new Error('useCluster must be used within a ClusterProvider');
  }
  return context;
};

export const ClusterProvider = ({ children }) => {
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState('');
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchClusters = useCallback(async () => {
    // Don't fetch if not authenticated or auth is still loading
    if (!isAuthenticated || authLoading) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.cluster.getClusters();
      const data = response.data || [];
      setClusters(data);
      if (data && data.length > 0 && !selectedCluster) {
        setSelectedCluster(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch clusters:', error);
      enqueueSnackbar('Failed to fetch clusters: ' + error.message, { variant: 'error' });
      setClusters([]); // Clear clusters on error
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, selectedCluster, isAuthenticated, authLoading]);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  const addCluster = async (name, brokers) => {
    if (!isAuthenticated) {
      enqueueSnackbar('Please login to add clusters', { variant: 'error' });
      return;
    }

    try {
      await api.cluster.addCluster({ name, brokers: brokers.split(',') });
      enqueueSnackbar(`Cluster "${name}" added successfully!`, { variant: 'success' });
      await fetchClusters(); // Refresh the list
    } catch (error) {
      enqueueSnackbar('Failed to add cluster: ' + error.message, { variant: 'error' });
      throw error; // Re-throw to handle in component
    }
  };

  const removeCluster = async (name) => {
    if (!isAuthenticated) {
      enqueueSnackbar('Please login to remove clusters', { variant: 'error' });
      return;
    }

    try {
      await api.cluster.removeCluster(name);
      enqueueSnackbar(`Cluster "${name}" removed successfully!`, { variant: 'info' });
      await fetchClusters(); // Refresh
    } catch (error) {
      enqueueSnackbar('Failed to remove cluster: ' + error.message, { variant: 'error' });
    }
  };

  const changeCluster = (clusterName) => {
    setSelectedCluster(clusterName);
  };

  const value = {
    clusters,
    selectedCluster,
    loading,
    addCluster,
    removeCluster,
    changeCluster,
    refreshClusters: fetchClusters,
  };

  return (
    <ClusterContext.Provider value={value}>
      {children}
    </ClusterContext.Provider>
  );
}; 