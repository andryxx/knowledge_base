import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { v7 as uuidv7 } from 'uuid';
import { ArticleController } from './article.controller';
import { ArticleService } from '../service/article.service';
import { CreateArticleDto } from '../types/create.article.dto';
import { UpdateArticleDto } from '../types/update.article.dto';
import { SearchArticlesDto } from '../types/search.articles.dto';

describe('ArticleController', () => {
  let articleController: ArticleController;
  let mockArticleService: DeepMocked<ArticleService>;

  const userId = uuidv7();
  const articleId = uuidv7();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
    })
      .useMocker(createMock)
      .compile();

    articleController = module.get<ArticleController>(ArticleController);
    mockArticleService = module.get(ArticleService);
  });

  it('should be defined', () => {
    expect(articleController).toBeDefined();
  });

  describe('createArticle', () => {
    it('should call article service', async () => {
      const req = { userId };
      const createArticleDto = new CreateArticleDto();

      await articleController.createArticle(req, createArticleDto);

      expect(mockArticleService.createArticle).toHaveBeenCalledTimes(1);
      expect(mockArticleService.createArticle).toHaveBeenCalledWith({
        userId,
        ...createArticleDto,
      });
    });
  });

  describe('searchArticles', () => {
    it('should call article service', async () => {
      const searchArticlesDto = new SearchArticlesDto();
      const req = { headers: {} };

      await articleController.searchArticles(searchArticlesDto, req);

      expect(mockArticleService.searchArticles).toHaveBeenCalledTimes(1);
      expect(mockArticleService.searchArticles).toHaveBeenCalledWith({
        ...searchArticlesDto,
        userId: undefined,
      });
    });

    it('should call article service with userId when authorization header is provided', async () => {
      const searchArticlesDto = new SearchArticlesDto();
      const req = { 
        headers: { 
          authorization: 'Bearer valid-token' 
        } 
      };

      const mockTokenVerificationService = {
        extractUserIdFromSessionToken: jest.fn().mockReturnValue(userId),
      };
      
      (articleController as any).tokenVerificationService = mockTokenVerificationService;

      await articleController.searchArticles(searchArticlesDto, req);

      expect(mockArticleService.searchArticles).toHaveBeenCalledTimes(1);
      expect(mockArticleService.searchArticles).toHaveBeenCalledWith({
        ...searchArticlesDto,
        userId,
      });
      expect(mockTokenVerificationService.extractUserIdFromSessionToken).toHaveBeenCalledWith('valid-token');
    });
  });

  describe('getArticleById', () => {
    it('should call article service', async () => {
      await articleController.getArticleById(articleId);

      expect(mockArticleService.getArticleById).toHaveBeenCalledTimes(1);
      expect(mockArticleService.getArticleById).toHaveBeenCalledWith(articleId);
    });
  });

  describe('updateArticle', () => {
    it('should call article service', async () => {
      const updateArticleDto = new UpdateArticleDto({});

      await articleController.updateArticle(articleId, updateArticleDto);

      expect(mockArticleService.updateArticle).toHaveBeenCalledTimes(1);
      expect(mockArticleService.updateArticle).toHaveBeenCalledWith({
        articleId,
        ...updateArticleDto,
      });
    });
  });

  describe('deleteArticle', () => {
    it('should call article service', async () => {
      await articleController.deleteArticle(articleId);

      expect(mockArticleService.deleteArticle).toHaveBeenCalledTimes(1);
      expect(mockArticleService.deleteArticle).toHaveBeenCalledWith(articleId);
    });
  });
});
