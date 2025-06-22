import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Topic as TopicIcon,
  Group as GroupIcon,
  BarChart as BarChartIcon,
  Home as HomeIcon,
  Close as CloseIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const drawerWidth = 280;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
  },
}));

const StyledAppBar = styled(AppBar)(({ theme, open }) => ({
  background: 'rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    }),
  })
);

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  margin: '4px 12px',
  borderRadius: 12,
  minHeight: 48,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(active && {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(129, 140, 248, 0.1) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(129, 140, 248, 0.15) 100%)',
    },
  }),
  '&:hover': {
    background: active 
      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(129, 140, 248, 0.15) 100%)'
      : 'rgba(255, 255, 255, 0.05)',
    transform: 'translateX(4px)',
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme, active }) => ({
  minWidth: 40,
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  transition: 'all 0.2s ease',
}));

const StyledListItemText = styled(ListItemText)(({ theme, active }) => ({
  '& .MuiListItemText-primary': {
    fontWeight: active ? 600 : 500,
    color: active ? theme.palette.primary.main : theme.palette.text.primary,
    transition: 'all 0.2s ease',
  },
}));

const navigationItems = [
  { text: 'Overview', icon: <HomeIcon />, path: '/' },
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Topics', icon: <TopicIcon />, path: '/topics' },
  { text: 'Consumer Groups', icon: <GroupIcon />, path: '/consumer-groups' },
  { text: 'Brokers', icon: <StorageIcon />, path: '/brokers' },
  { text: 'Metrics', icon: <BarChartIcon />, path: '/metrics' },
];

function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              width: 40,
              height: 40,
            }}
          >
            K
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Kafka UI
            </Typography>
            <Chip
              label="v2.0"
              size="small"
              sx={{
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'primary.main',
                fontSize: '0.75rem',
                height: 20,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, py: 2 }}>
        <List>
          {navigationItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem key={item.text} disablePadding>
                <StyledListItemButton
                  active={active}
                  onClick={() => handleNavigation(item.path)}
                  sx={{ mx: 1.5, mb: 0.5 }}
                >
                  <StyledListItemIcon active={active}>
                    {item.icon}
                  </StyledListItemIcon>
                  <StyledListItemText 
                    primary={item.text} 
                    active={active}
                  />
                </StyledListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center' }}>
          Modern Kafka Management
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <StyledAppBar position="fixed" open={open && !isMobile}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => isActive(item.path))?.text || 'Kafka UI'}
          </Typography>
          <Chip
            label="Connected"
            color="success"
            size="small"
            sx={{ 
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'success.main',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          />
        </Toolbar>
      </StyledAppBar>

      {/* Sidebar */}
      <StyledDrawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {drawer}
      </StyledDrawer>

      {/* Main Content */}
      <Main open={open && !isMobile}>
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {children}
        </Container>
      </Main>
    </Box>
  );
}

export default Layout; 