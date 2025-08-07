import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from './controller/article.controller';
import { ArticleService } from './service/article.service';
import { ArticleStorage } from './storage/article.storage';
import { ArticleEntity } from '@typeorm/models/article.entity';

@Module({
  controllers: [ArticleController],
  providers: [ArticleService, ArticleStorage],
  imports: [TypeOrmModule.forFeature([ArticleEntity])],
})
export class ArticleModule {}
