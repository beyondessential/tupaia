const hookRegistry = {};

export function registerHook(name, callback) {
  hookRegistry[name] = callback;
  return callback;
}

const isEntityAttribute = name => name.substring(0, 15) === 'entityAttribute';

export function getHook(name) {
  const hook = isEntityAttribute(name) ? hookRegistry.entityAttribute : hookRegistry[name];

  if (!hook) {
    throw new Error('No such hook: ', name);
  }

  return hook;
}
