import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import BarChartIcon from '@mui/icons-material/BarChart';

const StyledLink = styled(Button)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

function Navbar() {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" color="primary" sx={{ flexGrow: 0, mr: 4 }}>
          Kafka UI
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <StyledLink component={RouterLink} to="/">
            Dashboard
          </StyledLink>
          <StyledLink component={RouterLink} to="/topics">
            Topics
          </StyledLink>
          <StyledLink component={RouterLink} to="/consumer-groups">
            Consumer Groups
          </StyledLink>
          <StyledLink 
            component={RouterLink} 
            to="/metrics"
            startIcon={<BarChartIcon />}
          >
            Metrics
          </StyledLink>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 