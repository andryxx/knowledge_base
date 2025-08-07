import { Injectable, Logger } from '@nestjs/common';
import { CreateArticleConfig } from '../types/create.article.config';
import { ArticleDto } from '../types/article.dto';
import { UpdateArticleConfig } from '../types/update.article.config';
import { SearchArticlesConfig } from '../types/search.articles.config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, ArrayOverlap, Not, Between } from 'typeorm';
import { ArticleEntity } from '@typeorm/models/article.entity';
import { GetFromCacheById } from 'src/redis/decorators/get.from.cache.by.id.decorator';
import { DeleteFromCache } from 'src/redis/decorators/delete.from.cache.decorator';
import { RedisService } from 'src/redis/service/redis.service';

@Injectable()
export class ArticleStorage {
  private readonly logger = new Logger(ArticleStorage.name);

  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    private readonly redisService: RedisService,
  ) {}

  async createArticle(config: CreateArticleConfig): Promise<ArticleDto> {
    const newArticle = this.articleRepository.create(config);
    const savedArticle = await this.articleRepository.save(newArticle);
    return new ArticleDto(savedArticle);
  }

  @GetFromCacheById(ArticleDto)
  async getArticleById(articleId: string): Promise<ArticleDto> {
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
      relations: ['author'],
      select: {
        author: {
          name: true,
        },
      },
    });

    if (!article) return null;

    return new ArticleDto(article);
  }

  async searchArticles(config: SearchArticlesConfig): Promise<ArticleDto[]> {
    const {
      limit,
      offset,
      active,
      access,
      tags,
      header,
      userId,
      createdAtFrom,
      createdAtTo,
    } = config;

    let whereConditions: any = {};

    if (active !== undefined) {
      whereConditions.active = active;
    }

    if (access !== undefined) {
      whereConditions.access = access;
    }

    if (header) {
      whereConditions.header = ILike(`%${header}%`);
    }

    if (tags && tags.length > 0) {
      whereConditions.tags = ArrayOverlap(tags);
    }

    if (createdAtFrom || createdAtTo) {
      const dateConditions: any = {};

      if (createdAtFrom) {
        dateConditions.createdAt = Between(
          new Date(createdAtFrom),
          createdAtTo ? new Date(createdAtTo) : new Date(),
        );
      } else if (createdAtTo) {
        dateConditions.createdAt = Between(new Date(0), new Date(createdAtTo));
      }

      whereConditions = { ...whereConditions, ...dateConditions };
    }

    if (userId) {
      whereConditions = [
        { ...whereConditions, access: Not('PRIVATE') },
        { ...whereConditions, access: 'PRIVATE', userId },
      ];
    } else {
      whereConditions.access = 'PUBLIC';
    }

    const articles = await this.articleRepository.find({
      where: whereConditions,
      relations: ['author'],
      select: {
        author: {
          name: true,
        },
      },
      take: limit,
      skip: offset,
    });

    return articles.map((article) => new ArticleDto(article));
  }

  @DeleteFromCache()
  async updateArticle(config: UpdateArticleConfig): Promise<ArticleDto> {
    const { articleId, active, header, content, tags, access } = config;

    const article = await this.articleRepository.findOne({
      where: { id: articleId },
      select: {
        author: {
          name: true,
        },
      },
      relations: ['author'],
    });

    if (!article) return null;

    if (active !== undefined) article.active = active;
    if (header) article.header = header;
    if (content !== undefined) article.content = content;
    if (tags !== undefined) article.tags = tags;
    if (access) article.access = access;

    const updatedArticle = await this.articleRepository.save(article);

    return new ArticleDto(updatedArticle);
  }

  @DeleteFromCache()
  async deleteArticle(articleId: string): Promise<{ id: string }> {
    await this.articleRepository.delete({ id: articleId });
    return { id: articleId };
  }
}
