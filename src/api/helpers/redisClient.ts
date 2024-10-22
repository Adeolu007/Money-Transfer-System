import { createClient } from 'redis';

const redisClient = createClient();

async function connect() {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error('Error connecting to Redis:', error);
    }
}

async function disconnect() {
    try {
        if (redisClient.isOpen) {
            await redisClient.quit();
        }
    } catch (error) {
        console.error('Error disconnecting from Redis:', error);
    }
}

export { redisClient, connect, disconnect };

