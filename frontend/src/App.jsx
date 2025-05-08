import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import Navbar from './components/common/Navbar';
import Dashboard from './pages/Dashboard';
import Topics from './pages/Topics';
import TopicDetails from './pages/TopicDetails';
import ConsumerGroups from './pages/ConsumerGroups';

function App() {
    return (
        <ChakraProvider>
            <Router>
                <Box minH="100vh" bg="gray.50">
                    <Navbar />
                    <Box p={4}>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/topics" element={<Topics />} />
                            <Route path="/topics/:topicName" element={<TopicDetails />} />
                            <Route path="/consumer-groups" element={<ConsumerGroups />} />
                        </Routes>
                    </Box>
                </Box>
            </Router>
        </ChakraProvider>
    );
}

export default App; 