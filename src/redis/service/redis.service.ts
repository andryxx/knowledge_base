import { Inject, Injectable, Logger } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from 'src/redis/types/redis.client.const';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: RedisClientType) {
    this.logger.debug(this.redis ? 'Cache enabled' : 'Cache disabled');
  }

  async getObjectById<T>(objectId: string): Promise<T | null> {
    if (!this.redis) return null;

    try {
      const value = await this.redis.get(objectId);

      if (value) {
        return JSON.parse(value) as T;
      }

      return null;
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        this.logger.error({ error }, 'Error getting object from cache');
      }
      return null;
    }
  }

  async setObject<T>(object: T) {
    if (!this.redis) return;

    try {
      await this.redis.set(object['id'], JSON.stringify(object));
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        this.logger.error({ error }, 'Error setting object with cache');
      }
    }
  }

  async deleteObject(objectId: string) {
    if (!this.redis) return;

    try {
      await this.redis.del(objectId);
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        this.logger.error({ error }, 'Error deleting object from cache');
      }
    }
  }
}
