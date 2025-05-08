import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Heading,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Textarea,
    useToast,
} from '@chakra-ui/react';
import { getTopicDetails, getMessages, produceMessage } from '../services/api';

function TopicDetails() {
    const { topicName } = useParams();
    const [topicDetails, setTopicDetails] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const [newMessage, setNewMessage] = useState({
        key: '',
        value: '',
    });

    useEffect(() => {
        fetchTopicDetails();
        fetchMessages();
    }, [topicName]);

    const fetchTopicDetails = async () => {
        try {
            const data = await getTopicDetails(topicName);
            setTopicDetails(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch topic details',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const fetchMessages = async () => {
        try {
            const data = await getMessages(topicName);
            setMessages(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch messages',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleProduceMessage = async () => {
        try {
            await produceMessage(topicName, newMessage);
            toast({
                title: 'Success',
                description: 'Message produced successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            onClose();
            fetchMessages();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to produce message',
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
            <Box mb={6}>
                <Heading size="lg" mb={2}>
                    {topicName}
                </Heading>
                {topicDetails && (
                    <Text>
                        Partitions: {topicDetails.partitions} | Replicas: {topicDetails.replicas}
                    </Text>
                )}
            </Box>

            <Box mb={4}>
                <Button colorScheme="blue" onClick={onOpen}>
                    Produce Message
                </Button>
            </Box>

            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Offset</Th>
                        <Th>Key</Th>
                        <Th>Value</Th>
                        <Th>Timestamp</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {messages.map((message, index) => (
                        <Tr key={index}>
                            <Td>{message.offset}</Td>
                            <Td>{message.key}</Td>
                            <Td>{message.value}</Td>
                            <Td>{new Date(message.timestamp).toLocaleString()}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Produce Message</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            <FormLabel>Message Key</FormLabel>
                            <Textarea
                                value={newMessage.key}
                                onChange={(e) => setNewMessage({ ...newMessage, key: e.target.value })}
                                placeholder="Enter message key"
                            />
                        </FormControl>

                        <FormControl mt={4}>
                            <FormLabel>Message Value</FormLabel>
                            <Textarea
                                value={newMessage.value}
                                onChange={(e) => setNewMessage({ ...newMessage, value: e.target.value })}
                                placeholder="Enter message value"
                                rows={4}
                            />
                        </FormControl>

                        <Button colorScheme="blue" mr={3} mt={4} onClick={handleProduceMessage}>
                            Produce
                        </Button>
                        <Button onClick={onClose}>Cancel</Button>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default TopicDetails; 