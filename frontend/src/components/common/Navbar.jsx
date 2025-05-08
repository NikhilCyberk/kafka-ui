import { Box, Flex, Link, Heading } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function Navbar() {
    return (
        <Box bg="white" px={4} shadow="sm">
            <Flex h={16} alignItems="center" justifyContent="space-between">
                <Heading size="md" color="blue.600">Kafka UI</Heading>
                <Flex gap={8}>
                    <Link as={RouterLink} to="/" color="gray.600" _hover={{ color: 'blue.600' }}>
                        Dashboard
                    </Link>
                    <Link as={RouterLink} to="/topics" color="gray.600" _hover={{ color: 'blue.600' }}>
                        Topics
                    </Link>
                    <Link as={RouterLink} to="/consumer-groups" color="gray.600" _hover={{ color: 'blue.600' }}>
                        Consumer Groups
                    </Link>
                </Flex>
            </Flex>
        </Box>
    );
}

export default Navbar; 