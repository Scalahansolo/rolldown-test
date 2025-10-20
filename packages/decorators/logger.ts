export function Log(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`[LOG] Calling ${propertyKey} with args:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`[LOG] ${propertyKey} returned:`, result);
    return result;
  };

  return descriptor;
}

export function Trace(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const start = Date.now();
    const result = originalMethod.apply(this, args);
    const duration = Date.now() - start;
    console.log(`[TRACE] ${propertyKey} took ${duration}ms`);
    return result;
  };

  return descriptor;
}
