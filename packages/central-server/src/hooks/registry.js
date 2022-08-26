import { ENTITY_ATTRIBUTE_HOOK_PREFIX } from './constants';

const hookRegistry = {};

export function registerHook(name, callback) {
  hookRegistry[name] = callback;
  return callback;
}

const isEntityAttribute = name => {
  return name.startsWith(ENTITY_ATTRIBUTE_HOOK_PREFIX);
};

export function getHook(name) {
  const hook = isEntityAttribute(name)
    ? hookRegistry[ENTITY_ATTRIBUTE_HOOK_PREFIX]
    : hookRegistry[name];

  if (!hook) {
    throw new Error('No such hook: ', name);
  }

  return hook;
}
