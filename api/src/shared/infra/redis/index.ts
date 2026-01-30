import Redis from 'ioredis';

const redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    connectTimeout: 5000,
    commandTimeout: 2000,
    retryStrategy: (times) => {
        return Math.min(times * 100, 3000);
    }
});

redisClient.on('error', (err) => {
    console.error('[Redis Client Error]', err.message);
});

export { redisClient };
