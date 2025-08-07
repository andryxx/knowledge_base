import { DeleteFromCache } from './delete.from.cache.decorator';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { RedisService } from '../../redis/service/redis.service';
import { Logger } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';

class TestService {
  public redisService: DeepMocked<RedisService>;
  public logger: DeepMocked<Logger>;

  constructor(redisService: DeepMocked<RedisService>) {
    this.redisService = redisService;
    this.logger = createMock<Logger>();
  }

  @DeleteFromCache()
  async deleteById(id: string): Promise<any> {
    return { id };
  }

  @DeleteFromCache()
  async deleteByIdWithoutId(id: string): Promise<any> {
    return { name: 'test' };
  }

  @DeleteFromCache()
  async deleteByIdReturnNull(id: string): Promise<any> {
    return null;
  }
}

describe('DeleteFromCache Decorator', () => {
  let service: TestService;
  let redisService: DeepMocked<RedisService>;

  beforeEach(() => {
    redisService = createMock<RedisService>();
    service = new TestService(redisService);
    jest.clearAllMocks();
  });

  it('should call redisService.deleteObject with id if result has id', async () => {
    const id = uuidv7();
    const result = await service.deleteById(id);

    expect(result).toEqual({ id });
    expect(redisService.deleteObject).toHaveBeenCalledWith(id);
    expect(service.logger.debug).toHaveBeenCalledWith(`Deleted cache for ID: ${id}`);
  });

  it('should warn and return result if result does not have id', async () => {
    const id = uuidv7();
    const result = await service.deleteByIdWithoutId(id);

    expect(result).toEqual({ name: 'test' });
    expect(redisService.deleteObject).not.toHaveBeenCalled();
    expect(service.logger.warn).toHaveBeenCalledWith(
      'Unable to delete cache due to missing object ID',
    );
  });

  it('should warn and return result if result is null', async () => {
    const id = uuidv7();
    const result = await service.deleteByIdReturnNull(id);

    expect(result).toBeNull();
    expect(redisService.deleteObject).not.toHaveBeenCalled();
    expect(service.logger.warn).toHaveBeenCalledWith(
      'Unable to delete cache due to missing object ID',
    );
  });

  it('should warn and return result if redisService is not available', async () => {
    service.redisService = null as any;
    const id = uuidv7();
    const result = await service.deleteById(id);

    expect(result).toEqual({ id });
    expect(service.logger.warn).toHaveBeenCalledWith('Redis service is not available');
  });
});
