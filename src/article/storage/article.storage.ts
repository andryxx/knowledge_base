import { Injectable, Logger } from '@nestjs/common';
import { CreateArticleConfig } from '../types/create.article.config';
import { ArticleDto } from '../types/article.dto';
import { UpdateArticleConfig } from '../types/update.article.config';
import { SearchArticlesConfig } from '../types/search.articles.config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, ArrayOverlap, Not, Raw } from 'typeorm';
import { ArticleEntity } from '@typeorm/models/article.entity';

@Injectable()
export class ArticleStorage {
  private readonly logger = new Logger(ArticleStorage.name);

  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  async createArticle(config: CreateArticleConfig): Promise<ArticleDto> {
    const newArticle = this.articleRepository.create(config);
    const savedArticle = await this.articleRepository.save(newArticle);
    return new ArticleDto(savedArticle);
  }

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
    const { limit, offset, active, access, tags, header, userId } = config;

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

  async deleteArticle(articleId: string): Promise<void> {
    await this.articleRepository.delete({ id: articleId });
  }
}
