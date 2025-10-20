export function Entity(name: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      entityName = name;
      createdAt = new Date();
    };
  };
}

export function ReadOnly(target: any, propertyKey: string) {
  Object.defineProperty(target, propertyKey, {
    writable: false,
    configurable: false
  });
}

export function Required(target: any, propertyKey: string) {
  let value: any;

  const getter = function () {
    if (value === undefined) {
      throw new Error(`Property ${propertyKey} is required but was not set`);
    }
    return value;
  };

  const setter = function (newVal: any) {
    if (newVal === undefined || newVal === null) {
      throw new Error(`Property ${propertyKey} cannot be null or undefined`);
    }
    value = newVal;
  };

  Object.defineProperty(target, propertyKey, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true
  });
}
