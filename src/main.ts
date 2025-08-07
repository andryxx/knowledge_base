import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { version } from '../package.json';
import { appConfig } from './app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const port = appConfig.APP_PORT;

  app.useLogger(app.get(Logger));

  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setVersion(version)
    .setTitle('knowledge-base')
    .setDescription('Knowledge base')
    .addTag('Article')
    .addTag('User')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/knowledge-base/api', app, document);

  await app.listen(port);
}

bootstrap();
