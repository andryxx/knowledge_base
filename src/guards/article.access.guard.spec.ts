import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { TokenVerificationService } from 'src/security/token.verification.service';
import { ArticleStorage } from 'src/article/storage/article.storage';
import { ArticleAccessGuard } from './article.access.guard';
import { AccessEnum } from '@typeorm/models/article.entity';
import { ArticleDto } from 'src/article/types/article.dto';
import { UserDto } from 'src/user/types/user.dto';
import { v7 as uuidv7 } from 'uuid';

describe('ArticleAccessGuard', () => {
  let mockTokenVerificationService: DeepMocked<TokenVerificationService>;
  let mockArticleStorage: DeepMocked<ArticleStorage>;
  let articleAccessGuard: ArticleAccessGuard;

  beforeEach(async () => {
    mockTokenVerificationService = createMock<TokenVerificationService>();
    mockArticleStorage = createMock<ArticleStorage>();
    articleAccessGuard = new ArticleAccessGuard(
      mockTokenVerificationService,
      mockArticleStorage,
    );
  });

  it('should be defined', () => {
    expect(articleAccessGuard).toBeDefined();
  });

  describe('canActivate', () => {
    const articleId = uuidv7();
    const userId = uuidv7();
    const correctBearerToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MDE0MzY4My1lMjVjLTQxOTEtOGNiOC05YjY5N2ZhZWM1YzciLCJpYXQiOjE2OTYyMTU5MDAsImV4cCI6MTY5NjMwMjMwMH0.M0fbj4-xtas6kMuyUFY_w4-NeEibDLd_k_kUj3w73VM';

    const createMockArticle = (overrides: Partial<ArticleDto> = {}): ArticleDto => {
      return new ArticleDto({
        id: articleId,
        access: AccessEnum.PUBLIC,
        userId: uuidv7(),
        header: 'Test Article',
        content: 'Content',
        tags: ['test'],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: new UserDto({
          id: uuidv7(),
          name: 'Author',
          email: 'author@example.com',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        ...overrides,
      });
    };

    it('should return true for PUBLIC article without authentication', async () => {
      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
        params: { articleId },
        headers: {},
      });

      const publicArticle = createMockArticle({ access: AccessEnum.PUBLIC });
      mockArticleStorage.getArticleById.mockResolvedValueOnce(publicArticle);

      const result = await articleAccessGuard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should return true for RESTRICTED article with valid token', async () => {
      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
        params: { articleId },
        headers: { authorization: correctBearerToken },
      });

      const restrictedArticle = createMockArticle({ access: AccessEnum.RESTRICTED });
      mockArticleStorage.getArticleById.mockResolvedValueOnce(restrictedArticle);
      mockTokenVerificationService.extractUserIdFromSessionToken.mockReturnValueOnce(userId);

      const result = await articleAccessGuard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should return true for PRIVATE article owned by authenticated user', async () => {
      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
        params: { articleId },
        headers: { authorization: correctBearerToken },
      });

      const privateArticle = createMockArticle({ 
        access: AccessEnum.PRIVATE,
        userId: userId
      });
      mockArticleStorage.getArticleById.mockResolvedValueOnce(privateArticle);
      mockTokenVerificationService.extractUserIdFromSessionToken.mockReturnValueOnce(userId);

      const result = await articleAccessGuard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should return false for PRIVATE article not owned by authenticated user', async () => {
      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
        params: { articleId },
        headers: { authorization: correctBearerToken },
      });

      const privateArticle = createMockArticle({ 
        access: AccessEnum.PRIVATE,
        userId: uuidv7()
      });
      mockArticleStorage.getArticleById.mockResolvedValueOnce(privateArticle);
      mockTokenVerificationService.extractUserIdFromSessionToken.mockReturnValueOnce(userId);

      const result = await articleAccessGuard.canActivate(mockExecutionContext);
      expect(result).toBe(false);
    });

    it('should throw NotFoundException if article does not exist', async () => {
      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
        params: { articleId },
        headers: {},
      });

      mockArticleStorage.getArticleById.mockResolvedValueOnce(null);

      const canActivate = () => articleAccessGuard.canActivate(mockExecutionContext);
      await expect(canActivate()).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException for RESTRICTED article without token', async () => {
      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
        params: { articleId },
        headers: {},
      });

      const restrictedArticle = createMockArticle({ access: AccessEnum.RESTRICTED });
      mockArticleStorage.getArticleById.mockResolvedValueOnce(restrictedArticle);

      const canActivate = () => articleAccessGuard.canActivate(mockExecutionContext);
      await expect(canActivate()).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for PRIVATE article without token', async () => {
      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
        params: { articleId },
        headers: {},
      });

      const privateArticle = createMockArticle({ access: AccessEnum.PRIVATE });
      mockArticleStorage.getArticleById.mockResolvedValueOnce(privateArticle);

      const canActivate = () => articleAccessGuard.canActivate(mockExecutionContext);
      await expect(canActivate()).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for RESTRICTED article with invalid token', async () => {
      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
        params: { articleId },
        headers: { authorization: correctBearerToken },
      });

      const restrictedArticle = createMockArticle({ access: AccessEnum.RESTRICTED });
      mockArticleStorage.getArticleById.mockResolvedValueOnce(restrictedArticle);
      mockTokenVerificationService.extractUserIdFromSessionToken.mockReturnValueOnce(null);

      const canActivate = () => articleAccessGuard.canActivate(mockExecutionContext);
      await expect(canActivate()).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for PRIVATE article with invalid token', async () => {
      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
        params: { articleId },
        headers: { authorization: correctBearerToken },
      });

      const privateArticle = createMockArticle({ access: AccessEnum.PRIVATE });
      mockArticleStorage.getArticleById.mockResolvedValueOnce(privateArticle);
      mockTokenVerificationService.extractUserIdFromSessionToken.mockReturnValueOnce(null);

      const canActivate = () => articleAccessGuard.canActivate(mockExecutionContext);
      await expect(canActivate()).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for RESTRICTED article with wrong token type', async () => {
      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
        params: { articleId },
        headers: { authorization: 'Barer invalid-token' },
      });

      const restrictedArticle = createMockArticle({ access: AccessEnum.RESTRICTED });
      mockArticleStorage.getArticleById.mockResolvedValueOnce(restrictedArticle);

      const canActivate = () => articleAccessGuard.canActivate(mockExecutionContext);
      await expect(canActivate()).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for PRIVATE article with wrong token type', async () => {
      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
        params: { articleId },
        headers: { authorization: 'Barer invalid-token' },
      });

      const privateArticle = createMockArticle({ access: AccessEnum.PRIVATE });
      mockArticleStorage.getArticleById.mockResolvedValueOnce(privateArticle);

      const canActivate = () => articleAccessGuard.canActivate(mockExecutionContext);
      await expect(canActivate()).rejects.toThrow(UnauthorizedException);
    });

    it('should set userId in request when token is valid', async () => {
      const mockRequest = {
        params: { articleId },
        headers: { authorization: correctBearerToken },
      };

      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce(mockRequest);

      const restrictedArticle = createMockArticle({ access: AccessEnum.RESTRICTED });
      mockArticleStorage.getArticleById.mockResolvedValueOnce(restrictedArticle);
      mockTokenVerificationService.extractUserIdFromSessionToken.mockReturnValueOnce(userId);

      await articleAccessGuard.canActivate(mockExecutionContext);
      expect(mockRequest['userId']).toBe(userId);
    });
  });
}); 