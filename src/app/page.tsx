'use client';

import { Box, Button, Container, Heading, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { FiCode, FiDatabase, FiLayers } from 'react-icons/fi';
import { useColorMode } from '@/libs/theme/color-mode';

export default function Home() {
  const { colorMode } = useColorMode();
  return (
    <Box>
      {/* Hero Section */}
      <Container maxW={'7xl'} py={16}>
        <Stack align={'center'} direction={{ base: 'column', md: 'row' }}>
          <Stack flex={1} gap={{ base: 5, md: 10 }}>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: '3xl', sm: '4xl', lg: '6xl' }}
            >
              <Text as={'span'} position={'relative'} color={'blue.400'}>
                Modern Web App
              </Text>
              <br />
              <Text as={'span'} color={'blue.400'}>
                Made Simple
              </Text>
            </Heading>
            <Text color={'gray.500'}>
              Welcome to our demo page built with Chakra UI and Next.js. This showcase demonstrates
              the power and flexibility of modern web development tools.
            </Text>
            <Stack gap={{ base: 4, sm: 6 }} direction={{ base: 'column', sm: 'row' }}>
              <Button
                rounded={'full'}
                size={'lg'}
                fontWeight={'normal'}
                px={6}
                colorScheme={'blue'}
                bg={'blue.400'}
                _hover={{ bg: 'blue.500' }}
              >
                Get Started
              </Button>
              <Button rounded={'full'} size={'lg'} fontWeight={'normal'} px={6}>
                Learn More
              </Button>
            </Stack>
          </Stack>
        </Stack>

        {/* Feature Section */}
        <Box py={20}>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={10}>
            {features.map((feature, index) => (
              <Box
                key={index}
                p={6}
                rounded={'xl'}
                borderWidth={1}
                borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
                _hover={{
                  transform: 'translateY(-5px)',
                  transition: 'all 0.3s ease',
                  shadow: 'lg',
                }}
              >
                <Icon as={feature.icon} w={10} h={10} mb={4} color={'blue.400'} />
                <Heading size="md" mb={4}>
                  {feature.title}
                </Heading>
                <Text color={'gray.500'}>{feature.description}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
}

const features = [
  {
    title: 'Modern Stack',
    description: 'Built with Next.js and Chakra UI for a modern development experience.',
    icon: FiLayers,
  },
  {
    title: 'Responsive Design',
    description: 'Fully responsive components that look great on any device.',
    icon: FiCode,
  },
  {
    title: 'Scalable Architecture',
    description: 'Organized and maintainable code structure for scaling your application.',
    icon: FiDatabase,
  },
];
