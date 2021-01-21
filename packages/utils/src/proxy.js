export const createClassExtendingProxy = (targetInstance, extendingClassInstance) => {
  return new Proxy(targetInstance, {
    get(target, prop) {
      if (extendingClassInstance[prop]) {
        return extendingClassInstance[prop];
      }
      return target[prop];
    },
  });
};
