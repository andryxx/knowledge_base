import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { ArticleStorage } from './article.storage';
import { ArticleEntity, AccessEnum } from '@typeorm/models/article.entity';
import { UserEntity } from '@typeorm/models/user.entity';
import { ArticleDto } from '../types/article.dto';
import { SearchArticlesConfig } from '../types/search.articles.config';
import { CreateArticleConfig } from '../types/create.article.config';
import { UpdateArticleConfig } from '../types/update.article.config';
import { dataSourceOptions } from '@typeorm/data.source';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/service/redis.service';

describe('ArticleStorage (Integration)', () => {
  let articleStorage: ArticleStorage;
  let articleRepository: Repository<ArticleEntity>;
  let userRepository: Repository<UserEntity>;
  let module: TestingModule;

  const userId = uuidv7();
  const articleId = uuidv7();

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...dataSourceOptions,
          entities: [UserEntity, ArticleEntity],
          synchronize: false,
          dropSchema: false,
          logging: false,
        }),
        TypeOrmModule.forFeature([UserEntity, ArticleEntity]),
        RedisModule,
      ],
      providers: [ArticleStorage],
    })
      .overrideProvider(RedisService)
      .useValue({
        getObjectById: jest.fn().mockResolvedValue(null),
        setObject: jest.fn().mockResolvedValue(undefined),
        deleteObject: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    articleStorage = module.get<ArticleStorage>(ArticleStorage);
    articleRepository = module.get<Repository<ArticleEntity>>(
      getRepositoryToken(ArticleEntity),
    );
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  }, 15000);

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    const testUserEntity = userRepository.create({
      id: userId,
      name: 'Jim Raynor',
      email: 'jim.raynor@terran.com',
      active: true,
      hash: 'hash_value',
      salt: 'salt_value',
    });
    await userRepository.save(testUserEntity);

    const testArticleEntity = articleRepository.create({
      id: articleId,
      header: 'Test Article',
      content: 'This is a test article content',
      tags: ['test', 'article'],
      access: AccessEnum.PUBLIC,
      active: true,
      userId: userId,
    });
    await articleRepository.save(testArticleEntity);
  });

  afterEach(async () => {
    await articleRepository.delete(articleId);
    await userRepository.delete(userId);
  });

  it('should be defined', () => {
    expect(articleStorage).toBeDefined();
  });

  describe('searchArticles', () => {
    it('should return articles array with basic search', async () => {
      const config: SearchArticlesConfig = {
        limit: 10,
        offset: 0,
      };

      const result = await articleStorage.searchArticles(config);

      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBeGreaterThanOrEqual(1);

      result.forEach((article) => {
        expect(article).toBeInstanceOf(ArticleDto);
        expect(article.id).toBeDefined();
        expect(article.header).toBeDefined();
        expect(article.content).toBeDefined();
        expect(article.tags).toBeDefined();
        expect(article.access).toBeDefined();
        expect(article.active).toBeDefined();
        expect(article.userId).toBeDefined();
        expect(article.createdAt).toBeDefined();
        expect(article.updatedAt).toBeDefined();
        expect(article.author).toBeDefined();
        expect(article.author.name).toBeDefined();
      });
    });

    it('should filter by active status', async () => {
      const config: SearchArticlesConfig = {
        limit: 10,
        offset: 0,
        active: true,
      };

      const result = await articleStorage.searchArticles(config);

      result.forEach((article) => {
        expect(article.active).toBeTruthy();
      });
    });

    it('should filter by access type', async () => {
      const config: SearchArticlesConfig = {
        limit: 10,
        offset: 0,
        access: AccessEnum.PUBLIC,
      };

      const result = await articleStorage.searchArticles(config);

      result.forEach((article) => {
        expect(article.access).toBe(AccessEnum.PUBLIC);
      });
    });

    it('should filter by header using ILIKE', async () => {
      const config: SearchArticlesConfig = {
        limit: 10,
        offset: 0,
        header: 'Test',
      };

      const result = await articleStorage.searchArticles(config);
      const testArticle = result.find((article) => article.id === articleId);

      expect(testArticle).toBeDefined();
      expect(testArticle.header).toBe('Test Article');
    });

    it('should filter by tags using ArrayOverlap with text[] type', async () => {
      const config: SearchArticlesConfig = {
        limit: 10,
        offset: 0,
        tags: ['test'],
        userId: userId,
      };

      const result = await articleStorage.searchArticles(config);
      const testArticle = result.find((article) => article.id === articleId);

      expect(testArticle).toBeDefined();
      expect(testArticle.tags).toContain('test');
    });

    it('should respect limit parameter', async () => {
      const config: SearchArticlesConfig = {
        limit: 1,
        offset: 0,
      };

      const result = await articleStorage.searchArticles(config);

      expect(result.length).toBeLessThanOrEqual(1);
    });

    it('should respect offset parameter', async () => {
      const allArticlesConfig: SearchArticlesConfig = {
        limit: 100,
        offset: 0,
      };
      const allArticles =
        await articleStorage.searchArticles(allArticlesConfig);

      if (allArticles.length > 1) {
        const offsetConfig: SearchArticlesConfig = {
          limit: 99,
          offset: 1,
        };
        const offsetArticles =
          await articleStorage.searchArticles(offsetConfig);

        expect(offsetArticles.length).toBe(allArticles.length - 1);

        if (offsetArticles.length > 0) {
          expect(offsetArticles[0].id).not.toBe(allArticles[0].id);
        }
      }
    });

    it('should combine multiple filters including tags', async () => {
      const config: SearchArticlesConfig = {
        limit: 10,
        offset: 0,
        header: 'Test',
        active: true,
        access: AccessEnum.PUBLIC,
        tags: ['test'],
        userId: userId,
      };

      const result = await articleStorage.searchArticles(config);

      result.forEach((article) => {
        expect(article.active).toBeTruthy();
        expect(article.access).toBe(AccessEnum.PUBLIC);
        expect(article.header.toLowerCase()).toContain('test');
        expect(article.tags).toContain('test');
      });
    });

    it('should return empty array when no articles match filters', async () => {
      const config: SearchArticlesConfig = {
        limit: 10,
        offset: 0,
        header: 'nonexistent_header',
      };

      const result = await articleStorage.searchArticles(config);

      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(0);
    });

    it('should show only PUBLIC articles for anonymous user', async () => {
      const privateArticleId = uuidv7();
      const privateArticle = articleRepository.create({
        id: privateArticleId,
        header: 'Private Article',
        content: 'Private content',
        tags: ['private'],
        access: AccessEnum.PRIVATE,
        active: true,
        userId: userId,
      });
      await articleRepository.save(privateArticle);

      const config: SearchArticlesConfig = {
        limit: 10,
        offset: 0,
      };

      const result = await articleStorage.searchArticles(config);

      result.forEach((article) => {
        expect(article.access).toBe(AccessEnum.PUBLIC);
      });

      expect(result.find((a) => a.id === privateArticleId)).toBeUndefined();

      await articleRepository.delete(privateArticleId);
    });

    it('should show own PRIVATE articles for authorized user', async () => {
      const privateArticleId = uuidv7();
      const privateArticle = articleRepository.create({
        id: privateArticleId,
        header: 'My Private Article',
        content: 'My private content',
        tags: ['private'],
        access: AccessEnum.PRIVATE,
        active: true,
        userId: userId,
      });
      await articleRepository.save(privateArticle);

      const config: SearchArticlesConfig = {
        limit: 10,
        offset: 0,
        userId: userId,
      };

      const result = await articleStorage.searchArticles(config);

      const privateArticleResult = result.find(
        (a) => a.id === privateArticleId,
      );
      expect(privateArticleResult).toBeDefined();
      expect(privateArticleResult.access).toBe(AccessEnum.PRIVATE);
      expect(privateArticleResult.userId).toBe(userId);

      await articleRepository.delete(privateArticleId);
    });

    it('should not show other users PRIVATE articles for authorized user', async () => {
      const otherUserId = uuidv7();
      const otherUser = userRepository.create({
        id: otherUserId,
        name: 'Other User',
        email: 'other@test.com',
        active: true,
        hash: 'hash',
        salt: 'salt',
      });
      await userRepository.save(otherUser);

      const otherPrivateArticleId = uuidv7();
      const otherPrivateArticle = articleRepository.create({
        id: otherPrivateArticleId,
        header: 'Other Private Article',
        content: 'Other private content',
        tags: ['private'],
        access: AccessEnum.PRIVATE,
        active: true,
        userId: otherUserId,
      });
      await articleRepository.save(otherPrivateArticle);

      const config: SearchArticlesConfig = {
        limit: 10,
        offset: 0,
        userId: userId,
      };

      const result = await articleStorage.searchArticles(config);

      const otherPrivateArticleResult = result.find(
        (a) => a.id === otherPrivateArticleId,
      );
      expect(otherPrivateArticleResult).toBeUndefined();

      await articleRepository.delete(otherPrivateArticleId);
      await userRepository.delete(otherUserId);
    });

    it('should filter articles by date range from', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const config: SearchArticlesConfig = {
        limit: 10,
        offset: 0,
        createdAtFrom: futureDate.toISOString(),
      };

      const result = await articleStorage.searchArticles(config);

      expect(result).toEqual([]);
    });

    it('should filter articles by date range to', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const config: SearchArticlesConfig = {
        limit: 10,
        offset: 0,
        createdAtTo: pastDate.toISOString(),
      };

      const result = await articleStorage.searchArticles(config);

      expect(result).toEqual([]);
    });

    it('should filter articles by date range from and to', async () => {
      const now = new Date();
      const fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const toDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const config: SearchArticlesConfig = {
        limit: 10,
        offset: 0,
        createdAtFrom: fromDate.toISOString(),
        createdAtTo: toDate.toISOString(),
      };

      const result = await articleStorage.searchArticles(config);
      const testArticle = result.find((article) => article.id === articleId);

      expect(testArticle).toBeDefined();
    });

    it('should filter articles by date range with other filters', async () => {
      const now = new Date();
      const fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const toDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const config: SearchArticlesConfig = {
        limit: 10,
        offset: 0,
        active: true,
        header: 'Test',
        createdAtFrom: fromDate.toISOString(),
        createdAtTo: toDate.toISOString(),
      };

      const result = await articleStorage.searchArticles(config);
      const testArticle = result.find((article) => article.id === articleId);

      expect(testArticle).toBeDefined();
    });
  });

  describe('getArticleById', () => {
    it('should return article when found with author name', async () => {
      const result = await articleStorage.getArticleById(articleId);

      expect(result).toBeInstanceOf(ArticleDto);
      expect(result.id).toBe(articleId);
    });

    it('should return null when article not found', async () => {
      const nonExistentArticleId = uuidv7();

      const result = await articleStorage.getArticleById(nonExistentArticleId);

      expect(result).toBeNull();
    });
  });

  describe('createArticle', () => {
    it('should create a new article and return ArticleDto', async () => {
      const createArticleConfig: CreateArticleConfig = {
        userId: userId,
        header: 'New Article',
        content: 'New article content',
        tags: ['new', 'created'],
        access: AccessEnum.RESTRICTED,
      };

      const result = await articleStorage.createArticle(createArticleConfig);

      expect(result).toBeInstanceOf(ArticleDto);
      expect(result.id).toBeDefined();
      expect(result.header).toBe('New Article');
      expect(result.content).toBe('New article content');
      expect(result.tags).toEqual(['new', 'created']);
      expect(result.access).toBe(AccessEnum.RESTRICTED);
      expect(result.active).toBeTruthy();
      expect(result.userId).toBe(userId);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      const rawArticle = await articleRepository.findOne({
        where: { id: result.id },
      });
      expect(rawArticle.header).toBe('New Article');
      expect(rawArticle.content).toBe('New article content');

      await articleRepository.delete(result.id);
    });
  });

  describe('updateArticle', () => {
    it('should update article header and return ArticleDto', async () => {
      const updateArticleConfig: UpdateArticleConfig = {
        articleId: articleId,
        header: 'Updated Article Header',
      };

      const result = await articleStorage.updateArticle(updateArticleConfig);

      expect(result).toBeInstanceOf(ArticleDto);
      expect(result.id).toBe(articleId);
      expect(result.header).toBe('Updated Article Header');
      expect(result.content).toBe('This is a test article content');
      expect(result.tags).toEqual(['test', 'article']);
      expect(result.access).toBe(AccessEnum.PUBLIC);
      expect(result.active).toBeTruthy();

      const rawArticle = await articleRepository.findOne({
        where: { id: articleId },
      });
      expect(rawArticle.header).toBe('Updated Article Header');
    });

    it('should update article active status', async () => {
      const updateArticleConfig: UpdateArticleConfig = {
        articleId: articleId,
        active: false,
      };

      const result = await articleStorage.updateArticle(updateArticleConfig);

      expect(result.id).toBe(articleId);
      expect(result.active).toBeFalsy();

      const rawArticle = await articleRepository.findOne({
        where: { id: articleId },
      });
      expect(rawArticle.active).toBeFalsy();
    });

    it('should update article content', async () => {
      const updateArticleConfig: UpdateArticleConfig = {
        articleId: articleId,
        content: 'Updated content',
      };

      const result = await articleStorage.updateArticle(updateArticleConfig);

      expect(result.id).toBe(articleId);
      expect(result.content).toBe('Updated content');

      const rawArticle = await articleRepository.findOne({
        where: { id: articleId },
      });
      expect(rawArticle.content).toBe('Updated content');
    });

    it('should update article tags', async () => {
      const updateArticleConfig: UpdateArticleConfig = {
        articleId: articleId,
        tags: ['updated', 'tags'],
      };

      const result = await articleStorage.updateArticle(updateArticleConfig);

      expect(result.id).toBe(articleId);
      expect(result.tags).toEqual(['updated', 'tags']);

      const rawArticle = await articleRepository.findOne({
        where: { id: articleId },
      });
      expect(rawArticle.tags).toEqual(['updated', 'tags']);
    });

    it('should update article access', async () => {
      const updateArticleConfig: UpdateArticleConfig = {
        articleId: articleId,
        access: AccessEnum.PRIVATE,
      };

      const result = await articleStorage.updateArticle(updateArticleConfig);

      expect(result.id).toBe(articleId);
      expect(result.access).toBe(AccessEnum.PRIVATE);

      const rawArticle = await articleRepository.findOne({
        where: { id: articleId },
      });
      expect(rawArticle.access).toBe(AccessEnum.PRIVATE);
    });

    it('should update multiple fields at once', async () => {
      const updateArticleConfig: UpdateArticleConfig = {
        articleId: articleId,
        header: 'Multi Updated Article',
        content: 'Multi updated content',
        active: false,
        tags: ['multi', 'update'],
        access: AccessEnum.RESTRICTED,
      };

      const result = await articleStorage.updateArticle(updateArticleConfig);

      expect(result.id).toBe(articleId);
      expect(result.header).toBe('Multi Updated Article');
      expect(result.content).toBe('Multi updated content');
      expect(result.active).toBeFalsy();
      expect(result.tags).toEqual(['multi', 'update']);
      expect(result.access).toBe(AccessEnum.RESTRICTED);

      const rawArticle = await articleRepository.findOne({
        where: { id: articleId },
      });
      expect(rawArticle.header).toBe('Multi Updated Article');
      expect(rawArticle.content).toBe('Multi updated content');
      expect(rawArticle.active).toBeFalsy();
      expect(rawArticle.tags).toEqual(['multi', 'update']);
      expect(rawArticle.access).toBe(AccessEnum.RESTRICTED);
    });

    it('should not update fields when they are not provided', async () => {
      const updateArticleConfig: UpdateArticleConfig = {
        articleId,
      };

      const result = await articleStorage.updateArticle(updateArticleConfig);

      expect(result.id).toBe(articleId);
      expect(result.header).toBe('Test Article');
      expect(result.content).toBe('This is a test article content');
      expect(result.tags).toEqual(['test', 'article']);
      expect(result.access).toBe(AccessEnum.PUBLIC);
      expect(result.active).toBeTruthy();

      const rawArticle = await articleRepository.findOne({
        where: { id: articleId },
      });
      expect(rawArticle.header).toBe('Test Article');
      expect(rawArticle.content).toBe('This is a test article content');
      expect(rawArticle.tags).toEqual(['test', 'article']);
      expect(rawArticle.access).toBe(AccessEnum.PUBLIC);
      expect(rawArticle.active).toBeTruthy();
    });

    it('should return null when article not found', async () => {
      const nonExistentArticleId = uuidv7();
      const updateArticleConfig: UpdateArticleConfig = {
        articleId: nonExistentArticleId,
        header: 'Non Existent Article',
      };

      const result = await articleStorage.updateArticle(updateArticleConfig);

      expect(result).toBeNull();
    });

    it('should handle falsy values correctly for active field', async () => {
      const updateArticleConfig: UpdateArticleConfig = {
        articleId: articleId,
        active: false,
      };

      const result = await articleStorage.updateArticle(updateArticleConfig);

      expect(result.active).toBeFalsy();

      const updateBackConfig: UpdateArticleConfig = {
        articleId: articleId,
        active: true,
      };

      const backResult = await articleStorage.updateArticle(updateBackConfig);
      expect(backResult.active).toBeTruthy();
    });

    it('should handle undefined content correctly', async () => {
      const updateArticleConfig: UpdateArticleConfig = {
        articleId: articleId,
        content: undefined,
      };

      const result = await articleStorage.updateArticle(updateArticleConfig);

      expect(result.content).toBe('This is a test article content');

      const rawArticle = await articleRepository.findOne({
        where: { id: articleId },
      });
      expect(rawArticle.content).toBe('This is a test article content');
    });

    it('should handle setting content to null explicitly', async () => {
      const updateArticleConfig: UpdateArticleConfig = {
        articleId: articleId,
        content: null,
      };

      const result = await articleStorage.updateArticle(updateArticleConfig);

      expect(result.content).toBeNull();

      const rawArticle = await articleRepository.findOne({
        where: { id: articleId },
      });
      expect(rawArticle.content).toBeNull();
    });

    it('should handle undefined tags correctly', async () => {
      const updateArticleConfig: UpdateArticleConfig = {
        articleId: articleId,
        tags: undefined,
      };

      const result = await articleStorage.updateArticle(updateArticleConfig);

      expect(result.tags).toEqual(['test', 'article']);

      const rawArticle = await articleRepository.findOne({
        where: { id: articleId },
      });
      expect(rawArticle.tags).toEqual(['test', 'article']);
    });
  });

  describe('deleteArticle', () => {
    it('should delete article successfully', async () => {
      const deleteArticleId = uuidv7();
      const deleteArticle = articleRepository.create({
        id: deleteArticleId,
        header: 'Article to Delete',
        content: 'Content to delete',
        tags: ['delete'],
        access: AccessEnum.PUBLIC,
        active: true,
        userId: userId,
      });
      await articleRepository.save(deleteArticle);

      const beforeDelete = await articleRepository.findOne({
        where: { id: deleteArticleId },
      });
      expect(beforeDelete).toBeDefined();

      const result = await articleStorage.deleteArticle(deleteArticleId);
      expect(result).toEqual({ id: deleteArticleId });

      const afterDelete = await articleRepository.findOne({
        where: { id: deleteArticleId },
      });
      expect(afterDelete).toBeNull();
    });

    it('should not throw error when deleting non-existent article', async () => {
      const nonExistentArticleId = uuidv7();

      await expect(
        articleStorage.deleteArticle(nonExistentArticleId),
      ).resolves.not.toThrow();
    });
  });
});
