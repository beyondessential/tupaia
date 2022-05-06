const hookRegistry = {};

export function registerHook(name, callback) {
  hookRegistry[name] = callback;
  return callback;
}

export function getHook(name) {
  const hook = hookRegistry[name];

  if (!hook) {
    throw new Error('No such hook: ', name);
  }

  return hook;
}
