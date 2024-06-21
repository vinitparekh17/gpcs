import type { RedisClientOptions } from 'redis';
import { createClient } from 'redis';
import { AWS_REDIS_PASSWORD, AWS_REDIS_URL } from '../../config';

const option: RedisClientOptions = {
    url: AWS_REDIS_URL,
    password: AWS_REDIS_PASSWORD,
    socket: {
        keepAlive: -1,
    },
};

const redis = createClient(option);

export default redis;
