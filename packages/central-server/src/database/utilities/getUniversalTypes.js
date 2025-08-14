const MIN_APP_VERSION = '0.0.1';

/**
 * Returns database types that are supported by every app version ("universal")
 *
 * @param {ModelRegistry} models
 * @returns {string[]}
 */
export const getUniversalTypes = models => {
  const minAppVersionByType = models.getMinAppVersionByType();
  return Object.keys(minAppVersionByType).filter(
    type => minAppVersionByType[type] === MIN_APP_VERSION,
  );
};
