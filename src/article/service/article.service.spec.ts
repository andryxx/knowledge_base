import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { v7 as uuidv7 } from 'uuid';
import { ArticleService } from './article.service';
import { ArticleStorage } from '../storage/article.storage';
import { CreateArticleConfig } from '../types/create.article.config';
import { UpdateArticleConfig } from '../types/update.article.config';
import { SearchArticlesConfig } from '../types/search.articles.config';
import { AccessEnum } from '@typeorm/models/article.entity';

describe('ArticleService', () => {
  let articleService: ArticleService;
  let mockArticleStorage: DeepMocked<ArticleStorage>;

  const userId = uuidv7();
  const articleId = uuidv7();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArticleService],
    })
      .useMocker(createMock)
      .compile();

    articleService = module.get<ArticleService>(ArticleService);
    mockArticleStorage = module.get(ArticleStorage);
  });

  it('should be defined', () => {
    expect(articleService).toBeDefined();
  });

  describe('createArticle', () => {
    it('should create article', async () => {
      const createConfig: CreateArticleConfig = {
        userId,
        header: 'Test Article',
        content: 'Test content for the article',
        tags: ['test', 'article'],
        access: AccessEnum.PUBLIC,
      };

      await articleService.createArticle(createConfig);

      expect(mockArticleStorage.createArticle).toHaveBeenCalledTimes(1);
      expect(mockArticleStorage.createArticle).toHaveBeenCalledWith(createConfig);
    });
  });

  describe('getArticleById', () => {
    it('should return article', async () => {
      await articleService.getArticleById(articleId);

      expect(mockArticleStorage.getArticleById).toHaveBeenCalledTimes(1);
      expect(mockArticleStorage.getArticleById).toHaveBeenCalledWith(articleId);
    });
  });

  describe('updateArticle', () => {
    it('should update article', async () => {
      const updateConfig: UpdateArticleConfig = {
        articleId,
        header: 'Updated Article',
        content: 'Updated content',
        active: true,
        tags: ['updated', 'test'],
        access: AccessEnum.PRIVATE,
      };

      await articleService.updateArticle(updateConfig);

      expect(mockArticleStorage.updateArticle).toHaveBeenCalledTimes(1);
      expect(mockArticleStorage.updateArticle).toHaveBeenCalledWith(updateConfig);
    });
  });

  describe('searchArticles', () => {
    it('should search articles', async () => {
      const searchConfig: SearchArticlesConfig = {
        limit: 20,
        offset: 0,
        active: true,
        access: AccessEnum.PUBLIC,
        tags: ['test'],
        header: 'search query',
      };

      await articleService.searchArticles(searchConfig);

      expect(mockArticleStorage.searchArticles).toHaveBeenCalledTimes(1);
      expect(mockArticleStorage.searchArticles).toHaveBeenCalledWith(searchConfig);
    });

    it('should search articles with user filtering', async () => {
      const searchConfig: SearchArticlesConfig = {
        limit: 10,
        offset: 0,
        userId: userId,
      };

      await articleService.searchArticles(searchConfig);

      expect(mockArticleStorage.searchArticles).toHaveBeenCalledTimes(1);
      expect(mockArticleStorage.searchArticles).toHaveBeenCalledWith(searchConfig);
    });

    it('should search articles for anonymous user (no userId)', async () => {
      const searchConfig: SearchArticlesConfig = {
        limit: 10,
        offset: 0,

      };

      await articleService.searchArticles(searchConfig);

      expect(mockArticleStorage.searchArticles).toHaveBeenCalledTimes(1);
      expect(mockArticleStorage.searchArticles).toHaveBeenCalledWith(searchConfig);
    });
  });

  describe('deleteArticle', () => {
    it('should delete article', async () => {
      await articleService.deleteArticle(articleId);

      expect(mockArticleStorage.deleteArticle).toHaveBeenCalledTimes(1);
      expect(mockArticleStorage.deleteArticle).toHaveBeenCalledWith(articleId);
    });
  });
});
