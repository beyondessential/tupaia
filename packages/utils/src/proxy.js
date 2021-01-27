/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
