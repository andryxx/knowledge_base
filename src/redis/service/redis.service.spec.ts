import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../../redis/service/redis.service';
import { UserDto } from 'src/user/types/user.dto';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from '../types/redis.client.const';

describe('RedisService', () => {
  let redisService: RedisService;
  let mockRedis: DeepMocked<RedisClientType>;
  let module: TestingModule;

  const userId = 'user-id-1';
  const user = new UserDto({
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('redis is not null', () => {
    beforeEach(async () => {
      mockRedis = createMock<RedisClientType>();

      module = await Test.createTestingModule({
        providers: [
          RedisService,
          {
            provide: REDIS_CLIENT,
            useValue: mockRedis,
          },
        ],
      })
        .useMocker(createMock)
        .compile();

      redisService = module.get<RedisService>(RedisService);
    });

    it('should be defined', () => {
      expect(redisService).toBeDefined();
    });

    describe('getObjectById', () => {
      it('should return parsed object from cache if object is cached', async () => {
        const userId = 'user-id-1';
        const user = new UserDto({
          id: userId,
          name: 'John Doe',
          email: 'john@example.com',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        (mockRedis.get as jest.Mock).mockResolvedValueOnce(JSON.stringify(user));

        const result = await redisService.getObjectById(userId);

        expect(result).toMatchObject({
          id: user.id,
          name: user.name,
          email: user.email,
          active: user.active,
        });
        expect((result as any).createdAt).toBeDefined();
        expect((result as any).updatedAt).toBeDefined();
      });

      it('should return null if object is not cached', async () => {
        (mockRedis.get as jest.Mock).mockResolvedValueOnce(null);

        const result = await redisService.getObjectById(userId);

        expect(result).toBeNull();
      });

      it('should handle errors gracefully', async () => {
        (mockRedis.get as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));

        const result = await redisService.getObjectById(userId);

        expect(result).toBeNull();
      });
    });

    describe('setObject', () => {
      it('should call cache', async () => {
        await redisService.setObject(user);

        expect(mockRedis.set).toHaveBeenCalledWith(
          userId,
          JSON.stringify(user),
        );
      });

      it('should handle errors gracefully', async () => {
        (mockRedis.set as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));

        await expect(redisService.setObject(user)).resolves.not.toThrow();
      });
    });

    describe('deleteObject', () => {
      it('should call cache', async () => {
        await redisService.deleteObject(userId);

        expect(mockRedis.del).toHaveBeenCalledWith(userId);
      });

      it('should handle errors gracefully', async () => {
        (mockRedis.del as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));

        await expect(redisService.deleteObject(userId)).resolves.not.toThrow();
      });
    });
  });

  describe('redis is null', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          RedisService,
          {
            provide: REDIS_CLIENT,
            useValue: null,
          },
        ],
      })
        .useMocker(createMock)
        .compile();

      redisService = module.get<RedisService>(RedisService);
    });

    it('should be defined', () => {
      expect(redisService).toBeDefined();
    });

    describe('getObjectById', () => {
      it('should return null', async () => {
        const result = await redisService.getObjectById(userId);

        expect(result).toBeNull();
      });
    });

    describe('setObject', () => {
      it('should do nothing', async () => {
        await expect(redisService.setObject(user)).resolves.not.toThrow();
      });
    });

    describe('deleteObject', () => {
      it('should do nothing', async () => {
        await expect(redisService.deleteObject(userId)).resolves.not.toThrow();
      });
    });
  });
});
