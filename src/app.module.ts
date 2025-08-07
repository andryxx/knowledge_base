import { Module } from '@nestjs/common';
import { dataSourceOptions } from '@typeorm/data.source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import loggerSettings from './logger/logger.settings';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD } from '@nestjs/core';
import { UuidGuard } from './guards/uuid.guard';
import { SecurityModule } from './security/security.module';
import { HealthController } from './health/health.controller';
import { ArticleModule } from './article/article.module';
import { RedisModule } from './redis/redis.module';

@Module({
  controllers: [HealthController],
  providers: [
    UuidGuard,
    {
      provide: APP_GUARD,
      useExisting: UuidGuard,
    },
  ],
  imports: [
    LoggerModule.forRootAsync(loggerSettings),
    TypeOrmModule.forRoot(dataSourceOptions),
    SecurityModule,
    UserModule,
    ArticleModule,
    RedisModule,
  ],
})
export class AppModule {}
