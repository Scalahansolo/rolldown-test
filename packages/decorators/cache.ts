const cacheStore = new Map<string, any>();

export function Cached(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const cacheKey = `${propertyKey}_${JSON.stringify(args)}`;
    
    if (cacheStore.has(cacheKey)) {
      console.log(`[CACHE] Hit for ${propertyKey}`);
      return cacheStore.get(cacheKey);
    }

    console.log(`[CACHE] Miss for ${propertyKey}`);
    const result = originalMethod.apply(this, args);
    cacheStore.set(cacheKey, result);
    return result;
  };

  return descriptor;
}

export function ClearCache() {
  cacheStore.clear();
  console.log('[CACHE] Cleared all cache');
}
