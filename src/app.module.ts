import { Module } from '@nestjs/common';
import { dataSourceOptions } from 'typeorm/data.source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import loggerSettings from './logger/logger.settings';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD } from '@nestjs/core';
import { UuidGuard } from './guards/uuid.guard';
import { SecurityModule } from './security/security.module';

@Module({
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
  ],
})
export class AppModule {}
