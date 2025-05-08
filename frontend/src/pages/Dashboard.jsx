import { useState, useEffect } from 'react';
import {
    Box,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Heading,
    Text,
    useToast,
} from '@chakra-ui/react';
import { getTopics, getConsumerGroups } from '../services/api';

function Dashboard() {
    const [stats, setStats] = useState({
        topics: 0,
        consumerGroups: 0,
        totalMessages: 0,
        activeConsumers: 0,
    });
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [topics, consumerGroups] = await Promise.all([
                getTopics(),
                getConsumerGroups(),
            ]);

            setStats({
                topics: topics.length,
                consumerGroups: consumerGroups.length,
                totalMessages: 0, // This would need to be implemented in the backend
                activeConsumers: 0, // This would need to be implemented in the backend
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch dashboard stats',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <Box>
            <Heading size="lg" mb={6}>
                Dashboard
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                <Stat
                    px={4}
                    py={5}
                    bg="white"
                    shadow="sm"
                    rounded="md"
                    borderWidth="1px"
                >
                    <StatLabel>Total Topics</StatLabel>
                    <StatNumber>{stats.topics}</StatNumber>
                    <StatHelpText>Active topics in the cluster</StatHelpText>
                </Stat>

                <Stat
                    px={4}
                    py={5}
                    bg="white"
                    shadow="sm"
                    rounded="md"
                    borderWidth="1px"
                >
                    <StatLabel>Consumer Groups</StatLabel>
                    <StatNumber>{stats.consumerGroups}</StatNumber>
                    <StatHelpText>Active consumer groups</StatHelpText>
                </Stat>

                <Stat
                    px={4}
                    py={5}
                    bg="white"
                    shadow="sm"
                    rounded="md"
                    borderWidth="1px"
                >
                    <StatLabel>Total Messages</StatLabel>
                    <StatNumber>{stats.totalMessages}</StatNumber>
                    <StatHelpText>Messages across all topics</StatHelpText>
                </Stat>

                <Stat
                    px={4}
                    py={5}
                    bg="white"
                    shadow="sm"
                    rounded="md"
                    borderWidth="1px"
                >
                    <StatLabel>Active Consumers</StatLabel>
                    <StatNumber>{stats.activeConsumers}</StatNumber>
                    <StatHelpText>Currently active consumers</StatHelpText>
                </Stat>
            </SimpleGrid>
        </Box>
    );
}

export default Dashboard; 