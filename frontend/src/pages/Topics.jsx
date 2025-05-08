import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    NumberInput,
    NumberInputField,
    useToast,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { getTopics, createTopic } from '../services/api';

function Topics() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const [newTopic, setNewTopic] = useState({
        name: '',
        partitions: 1,
        replicas: 1,
    });

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            const data = await getTopics();
            setTopics(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch topics',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async () => {
        try {
            await createTopic(newTopic);
            toast({
                title: 'Success',
                description: 'Topic created successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            onClose();
            fetchTopics();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create topic',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <h1>Topics</h1>
                <Button colorScheme="blue" onClick={onOpen}>
                    Create Topic
                </Button>
            </Box>

            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Partitions</Th>
                        <Th>Replicas</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {topics.map((topic) => (
                        <Tr key={topic}>
                            <Td>
                                <RouterLink to={`/topics/${topic}`}>{topic}</RouterLink>
                            </Td>
                            <Td>-</Td>
                            <Td>-</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create New Topic</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            <FormLabel>Topic Name</FormLabel>
                            <Input
                                value={newTopic.name}
                                onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                                placeholder="Enter topic name"
                            />
                        </FormControl>

                        <FormControl mt={4}>
                            <FormLabel>Number of Partitions</FormLabel>
                            <NumberInput min={1} value={newTopic.partitions}>
                                <NumberInputField
                                    onChange={(e) => setNewTopic({ ...newTopic, partitions: parseInt(e.target.value) })}
                                />
                            </NumberInput>
                        </FormControl>

                        <FormControl mt={4}>
                            <FormLabel>Replication Factor</FormLabel>
                            <NumberInput min={1} value={newTopic.replicas}>
                                <NumberInputField
                                    onChange={(e) => setNewTopic({ ...newTopic, replicas: parseInt(e.target.value) })}
                                />
                            </NumberInput>
                        </FormControl>

                        <Button colorScheme="blue" mr={3} mt={4} onClick={handleCreateTopic}>
                            Create
                        </Button>
                        <Button onClick={onClose}>Cancel</Button>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default Topics; 