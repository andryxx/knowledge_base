import { Injectable } from '@nestjs/common';
import { ArticleStorage } from '../storage/article.storage';
import { CreateArticleConfig } from '../types/create.article.config';
import { ArticleDto } from '../types/article.dto';
import { UpdateArticleConfig } from '../types/update.article.config';
import { SearchArticlesConfig } from '../types/search.articles.config';

@Injectable()
export class ArticleService {
  constructor(private readonly articleStorage: ArticleStorage) {}

  async createArticle(config: CreateArticleConfig): Promise<ArticleDto> {
    return this.articleStorage.createArticle(config);
  }

  async getArticleById(articleId: string): Promise<ArticleDto> {
    return this.articleStorage.getArticleById(articleId);
  }

  async updateArticle(config: UpdateArticleConfig): Promise<ArticleDto> {
    return this.articleStorage.updateArticle(config);
  }

  async searchArticles(config: SearchArticlesConfig): Promise<ArticleDto[]> {
    return this.articleStorage.searchArticles(config);
  }

  async deleteArticle(articleId: string): Promise<void> {
    return this.articleStorage.deleteArticle(articleId);
  }
}
