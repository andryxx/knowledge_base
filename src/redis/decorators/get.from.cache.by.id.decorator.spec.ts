import 'reflect-metadata';
import { GetFromCacheById } from './get.from.cache.by.id.decorator';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { RedisService } from '../../redis/service/redis.service';
import { v7 as uuidv7 } from 'uuid';
import { Type } from 'class-transformer';

class TestCategoryDto {
  id: string;
  name: string;
  constructor(partial: Partial<TestCategoryDto>) {
    Object.assign(this, partial);
  }
}

class TestDto {
  id: string;
  from: string;

  @Type(() => TestCategoryDto)
  category: TestCategoryDto;

  constructor(partial: Partial<TestDto>) {
    Object.assign(this, partial);
  }
}

class TestService {
  public redisService: DeepMocked<RedisService>;

  constructor(redisService: DeepMocked<RedisService>) {
    this.redisService = redisService;
  }

  @GetFromCacheById<TestDto>(TestDto)
  async getById(id: string): Promise<TestDto> {
    return new TestDto({
      id,
      from: 'db',
      category: new TestCategoryDto({
        id: 'categoryId',
        name: 'categoryName',
      }),
    });
  }
}

describe('GetFromCacheById Decorator', () => {
  let service: TestService;
  let redisService: DeepMocked<RedisService>;

  beforeEach(() => {
    redisService = createMock<RedisService>();
    service = new TestService(redisService);
    jest.clearAllMocks();
  });

  it('should return object from cache if it exists and convert to DTO', async () => {
    const id = uuidv7();
    const cached = {
      id,
      from: 'cache',
      category: { id: 'categoryId', name: 'categoryName' },
    };
    redisService.getObjectById.mockResolvedValue(cached);

    const result = await service.getById(id);

    expect(result).toBeInstanceOf(TestDto);
    expect(result).toMatchObject({
      id,
      from: 'cache',
      category: { id: 'categoryId', name: 'categoryName' },
    });
    expect(result.category).toBeInstanceOf(TestCategoryDto);
    expect(redisService.getObjectById).toHaveBeenCalledWith(id);
    expect(redisService.setObject).not.toHaveBeenCalled();
  });

  it('should get object from source and put it in cache if it does not exist in cache', async () => {
    redisService.getObjectById.mockResolvedValue(undefined);

    const id = uuidv7();
    const expected = {
      id,
      from: 'db',
      category: { id: 'categoryId', name: 'categoryName' },
    };
    const result = await service.getById(id);

    expect(result).toBeInstanceOf(TestDto);
    expect(result).toMatchObject(expected);
    expect(result.category).toBeInstanceOf(TestCategoryDto);
    expect(redisService.getObjectById).toHaveBeenCalledWith(id);
    expect(redisService.setObject).toHaveBeenCalledWith(expected);
  });
});
