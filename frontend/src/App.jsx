import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Container } from '@mui/material';
import Navbar from './components/common/Navbar';
import Dashboard from './pages/Dashboard';
import Topics from './pages/Topics';
import TopicDetails from './pages/TopicDetails';
import ConsumerGroups from './pages/ConsumerGroups';
import MetricsDashboard from './components/metrics/MetricsDashboard';
import Overview from './pages/Overview';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Router configuration with future flags
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router {...routerConfig}>
        <Navbar />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/topics/:topicName" element={<TopicDetails />} />
            <Route path="/consumer-groups" element={<ConsumerGroups />} />
            <Route path="/metrics" element={<MetricsDashboard />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App; 