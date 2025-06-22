import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function NotFound() {
  return (
    <Box textAlign="center" mt={8}>
      <Typography variant="h2" color="primary" gutterBottom>404</Typography>
      <Typography variant="h5" gutterBottom>Page Not Found</Typography>
      <Typography variant="body1">The page you are looking for does not exist.</Typography>
    </Box>
  );
}

export default NotFound; 