import type { RedisClientOptions } from 'redis';
import { createClient } from 'redis';
import {
	AWS_REDIS_PASSWORD,
	AWS_REDIS_URL,
	NODE_ENV,
} from '../../config/index.ts';

const option: RedisClientOptions = NODE_ENV !== 'development'
	? {
		url: AWS_REDIS_URL,
		password: AWS_REDIS_PASSWORD,
	}
	: {
		url: 'redis://valkey:6379',
	};

const redis = createClient(option);

export default redis;
