import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Select, MenuItem, CircularProgress, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Divider, Fade, Avatar, Menu, MenuItem as MenuItemComponent } from '@mui/material';
import { FaMoon, FaSun, FaFeather, FaPlus, FaTrash, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useNavigate, useLocation, Outlet, Link as RouterLink, useParams } from 'react-router-dom';
import TopicIcon from '@mui/icons-material/Topic';
import StorageIcon from '@mui/icons-material/Storage';
import GroupIcon from '@mui/icons-material/Group';
import MessageIcon from '@mui/icons-material/Message';
import BarChartIcon from '@mui/icons-material/BarChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useCluster } from '../../contexts/ClusterContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import Modal from '../../components/common/Modal';
import Profile from '../../pages/auth/Profile';

const drawerWidth = 220;

const getDashboardNav = (clusterName) => [
  { text: 'Overview', icon: <DashboardIcon />, path: clusterName ? `/dashboard/${clusterName}/overview` : '#' },
  { text: 'Brokers', icon: <StorageIcon />, path: clusterName ? `/dashboard/${clusterName}/brokers` : '#' },
  { text: 'Topics', icon: <TopicIcon />, path: clusterName ? `/dashboard/${clusterName}/topics` : '#' },
  { text: 'Consumer Groups', icon: <GroupIcon />, path: clusterName ? `/dashboard/${clusterName}/consumer-groups` : '#' },
  { text: 'Metrics', icon: <BarChartIcon />, path: clusterName ? `/dashboard/${clusterName}/metrics` : '#' },
];

function ClusterManager({ open, onClose }) {
  const { clusters, addCluster, removeCluster } = useCluster();
  const [newClusterName, setNewClusterName] = useState('');
  const [newBrokerUrls, setNewBrokerUrls] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  const handleAdd = async () => {
    if (!newClusterName || !newBrokerUrls) return;
    setIsAdding(true);
    try {
      await addCluster(newClusterName, newBrokerUrls);
      navigate(`/dashboard/${newClusterName}/overview`);
      setNewClusterName('');
      setNewBrokerUrls('');
    } catch (error) {
      // Error is handled by context
      console.error('Failed to add cluster:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (name) => {
    await removeCluster(name);
    // After removing, if it was the last cluster, navigate to the base dashboard.
    if (clusters.length === 1) {
      navigate('/dashboard');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Clusters</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>Add New Cluster</Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Cluster Name"
            value={newClusterName}
            onChange={(e) => setNewClusterName(e.target.value)}
            size="small"
          />
          <TextField
            label="Broker URLs (comma-separated)"
            value={newBrokerUrls}
            onChange={(e) => setNewBrokerUrls(e.target.value)}
            size="small"
            placeholder="localhost:9092,localhost:9093"
          />
          <Button onClick={handleAdd} variant="contained" disabled={isAdding || !newClusterName || !newBrokerUrls}>
            {isAdding ? <CircularProgress size={24} /> : 'Add Cluster'}
          </Button>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>Existing Clusters</Typography>
        <List>
          {clusters.map(cluster => (
            <ListItem key={cluster} secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleRemove(cluster)}>
                <FaTrash />
              </IconButton>
            }>
              <ListItemText primary={cluster} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function Header({ darkMode, onToggleDark, onOpenManager }) {
    const navigate = useNavigate();
    const { clusterName } = useParams();
    const { clusters, selectedCluster, changeCluster, loading } = useCluster();
    const { user, logout } = useAuth();
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const theme = useTheme();
    const [profileOpen, setProfileOpen] = useState(false);

    const handleClusterChange = (newCluster) => {
        if (newCluster) {
            changeCluster(newCluster);
            navigate(`/dashboard/${newCluster}/overview`);
        }
    };

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        handleUserMenuClose();
    };

    // Sync context with URL on page load/refresh
    useEffect(() => {
        if (clusterName && clusterName !== selectedCluster) {
            changeCluster(clusterName);
        }
        // If the URL has no cluster, but we have clusters, go to the first one.
        if (!clusterName && clusters.length > 0 && !loading) {
            navigate(`/dashboard/${clusters[0]}/overview`);
        }
    }, [clusterName, selectedCluster, changeCluster, clusters, loading, navigate]);

    return (
        <AppBar
            position="fixed"
            sx={{
                width: `calc(100% - ${drawerWidth}px)`,
                ml: `${drawerWidth}px`,
                boxShadow: 'none',
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper'
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={700}>Kafka UI</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    {loading ? <CircularProgress size={24} /> : (
                        <Select
                            value={selectedCluster || ''}
                            onChange={(e) => handleClusterChange(e.target.value)}
                            size="small"
                            sx={{ minWidth: 150, mr: 1, fontWeight: 600 }}
                            displayEmpty
                        >
                            <MenuItem value="" disabled><em>No Clusters</em></MenuItem>
                            {clusters.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </Select>
                    )}
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={onOpenManager}
                        startIcon={<FaPlus />}
                    >
                        Manage
                    </Button>
                    <IconButton onClick={onToggleDark} color="inherit">
                        {darkMode ? (
                          <FaSun style={{ color: theme.palette.warning.main }} />
                        ) : (
                          <FaMoon style={{ color: theme.palette.grey[700] }} />
                        )}
                    </IconButton>

                    {/* User Menu */}
                    <IconButton
                        onClick={handleUserMenuOpen}
                        sx={{ ml: 1 }}
                    >
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            <FaUser size={16} />
                        </Avatar>
                    </IconButton>

                    <Menu
                        anchorEl={userMenuAnchor}
                        open={Boolean(userMenuAnchor)}
                        onClose={handleUserMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItemComponent disabled>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FaUser />
                                <Typography variant="body2">
                                    {user?.username || 'User'}
                                </Typography>
                            </Box>
                        </MenuItemComponent>
                        <MenuItemComponent onClick={() => { setProfileOpen(true); handleUserMenuClose(); }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FaUser />
                                <Typography variant="body2">Profile</Typography>
                            </Box>
                        </MenuItemComponent>
                        <Divider />
                        <MenuItemComponent onClick={handleLogout}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FaSignOutAlt />
                                <Typography variant="body2">Logout</Typography>
                            </Box>
                        </MenuItemComponent>
                    </Menu>

                    <Modal open={profileOpen} onClose={() => setProfileOpen(false)} title="Profile" maxWidth="sm">
                      <Profile />
                    </Modal>

                    <Button
                        variant="outlined"
                        color="primary"
                        sx={{ borderRadius: 8, fontWeight: 600, textTransform: 'none', ml: 2 }}
                        onClick={() => navigate('/')}
                    >
                        Back to Home
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default function DashboardLayout({ darkMode, onToggleDark }) {
    const location = useLocation();
    const { clusterName } = useParams();
    const dashboardNav = getDashboardNav(clusterName);
    const [managerOpen, setManagerOpen] = useState(false);

    const openClusterManager = () => setManagerOpen(true);

    return (
        <Box sx={{ display: 'flex' }}>
            <Header darkMode={darkMode} onToggleDark={onToggleDark} onOpenManager={openClusterManager} />
            
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none', bgcolor: 'background.default' },
                }}
            >
                <Toolbar>
                    <Box display="flex" alignItems="center" gap={1} sx={{ p: 1 }}>
                        <FaFeather size={28} />
                        <Typography variant="h6" fontWeight={700}>Kafka UI</Typography>
                    </Box>
                </Toolbar>
                <Box sx={{ overflow: 'auto', p: 1 }}>
                    <List>
                        {dashboardNav.map((item) => (
                            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                                <ListItemButton
                                    component={RouterLink}
                                    to={item.path}
                                    disabled={!clusterName && item.path !== '/dashboard'}
                                    selected={item.path !== '#' && location.pathname.startsWith(item.path)}
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: 'initial',
                                        px: 2.5,
                                        borderRadius: 2,
                                        margin: '0.5rem',
                                        '&.Mui-selected': {
                                            backgroundColor: 'primary.main',
                                            color: 'primary.contrastText',
                                            '& .MuiListItemIcon-root': {
                                                color: 'primary.contrastText',
                                            },
                                            '&:hover': {
                                                backgroundColor: 'primary.dark',
                                            }
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: 3,
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
                <Toolbar />
                <Fade in={true} timeout={400}>
                    <div>
                        <Outlet context={{ openClusterManager }} />
                    </div>
                </Fade>
            </Box>
            
            <ClusterManager open={managerOpen} onClose={() => setManagerOpen(false)} />
        </Box>
    );
} 