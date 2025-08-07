export function DeleteFromCache() {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      if (!this.redisService) {
        this.logger.warn('Redis service is not available');
        return result;
      }

      if (!result?.['id']) {
        this.logger.warn('Unable to delete cache due to missing object ID');
        return result;
      }

      await this.redisService.deleteObject(result['id']);
      this.logger.debug(`Deleted cache for ID: ${result['id']}`);

      return result;
    };
    return descriptor;
  };
}
