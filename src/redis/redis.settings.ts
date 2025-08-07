import { createClient } from 'redis';
import { REDIS_CLIENT } from './types/redis.client.const';
import { appConfig } from '../app.config';

export default {
  provide: REDIS_CLIENT,
  useFactory: async () => {
    const redisHost = appConfig.REDIS.HOST;
    const redisPort = appConfig.REDIS.PORT;
    const redisTls = appConfig.REDIS.TLS;

    if (!redisHost) {
      return null;
    }

    try {
      const client = createClient({
        socket: {
          host: redisHost,
          port: redisPort,
          tls: redisTls,
        },
        legacyMode: false,
      });

      await client.connect();
      return client;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      return null;
    }
  },
};
