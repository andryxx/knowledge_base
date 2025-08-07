import { plainToInstance } from 'class-transformer';

export function GetFromCacheById<T>(DtoClass: new (...args: any[]) => T) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<T>>,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]): Promise<T> {
      const id: string = args[0];
      let object = await this.redisService.getObjectById(id);

      if (!this.redisService) {
        this.logger.warn('Redis service is not available');
      }

      if (object) {
        return plainToInstance(DtoClass, object);
      }

      const objectFromStorage = await originalMethod.apply(this, args);

      if (objectFromStorage) {
        await this.redisService.setObject(objectFromStorage);
      }

      return objectFromStorage;
    };
    return descriptor;
  };
}
