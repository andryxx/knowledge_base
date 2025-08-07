import { Global, Module } from '@nestjs/common';
import { RedisService } from './service/redis.service';
import redisSettings from './redis.settings';

@Global()
@Module({
  providers: [redisSettings, RedisService],
  exports: [RedisService],
})
export class RedisModule {} 