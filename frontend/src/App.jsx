import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Layouts & Pages
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/landing/LandingPage';
import DashboardWelcome from './pages/dashboard/DashboardWelcome';
import Overview from './pages/dashboard/Overview';
import Topics from './pages/topics/Topics';
import Brokers from './pages/brokers/Brokers';
import ConsumerGroups from './pages/consumers/ConsumerGroups';
import Metrics from './pages/metrics/Metrics';
import NotFound from './pages/NotFound';
import TopicDetails from './pages/topics/TopicDetails';
import ConsumerGroupDetails from './pages/consumers/ConsumerGroupDetails';

// Authentication pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Profile from './pages/auth/Profile';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

export default function App({ darkMode, onToggleDark }) {
    const location = useLocation();

    useEffect(() => {
        // We can't initialize AOS here because it would re-init on every navigation
        // It's better to do it in main.jsx or a top-level component that doesn't re-render on route change
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

  return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage darkMode={darkMode} onToggleDark={onToggleDark} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected dashboard routes */}
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout darkMode={darkMode} onToggleDark={onToggleDark} />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardWelcome />} />
                <Route path="profile" element={<Profile />} />
                <Route path=":clusterName/overview" element={<Overview />} />
                <Route path=":clusterName/brokers" element={<Brokers />} />
                <Route path=":clusterName/topics" element={<Topics />} />
                <Route path=":clusterName/topics/:topicName" element={<TopicDetails />} />
                <Route path=":clusterName/consumer-groups" element={<ConsumerGroups />} />
                <Route path=":clusterName/consumer-groups/:groupId" element={<ConsumerGroupDetails />} />
                <Route path=":clusterName/metrics" element={<Metrics />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
