import { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    useToast,
} from '@chakra-ui/react';
import { getConsumerGroups, getConsumerGroupDetails } from '../services/api';

function ConsumerGroups() {
    const [consumerGroups, setConsumerGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchConsumerGroups();
    }, []);

    const fetchConsumerGroups = async () => {
        try {
            const data = await getConsumerGroups();
            setConsumerGroups(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch consumer groups',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGroupClick = async (groupId) => {
        try {
            const details = await getConsumerGroupDetails(groupId);
            setSelectedGroup(details);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch consumer group details',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <Box>
            <Heading size="lg" mb={6}>
                Consumer Groups
            </Heading>

            <Box display="flex" gap={8}>
                <Box flex={1}>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Group ID</Th>
                                <Th>Members</Th>
                                <Th>Lag</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {consumerGroups.map((groupId) => (
                                <Tr
                                    key={groupId}
                                    onClick={() => handleGroupClick(groupId)}
                                    cursor="pointer"
                                    _hover={{ bg: 'gray.50' }}
                                >
                                    <Td>{groupId}</Td>
                                    <Td>-</Td>
                                    <Td>-</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>

                {selectedGroup && (
                    <Box flex={1} p={4} bg="white" borderRadius="md" shadow="sm">
                        <Heading size="md" mb={4}>
                            {selectedGroup.group_id}
                        </Heading>
                        <Text mb={2}>Topics:</Text>
                        <Box mb={4}>
                            {selectedGroup.topics.map((topic) => (
                                <Text key={topic}>{topic}</Text>
                            ))}
                        </Box>
                        <Text>Members: {selectedGroup.members}</Text>
                        <Text>Lag: {selectedGroup.lag}</Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default ConsumerGroups; 