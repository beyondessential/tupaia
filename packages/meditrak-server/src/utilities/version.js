export const MIN_VERSION = '0.0.1';
export const MAX_VERSION = '999.999.999';

/**
 * Returns the previous version of a semantic version string. Format: *MAJOR.MINOR.PATCH*
 * Uses the assumption that MINOR and PATCH range is [0, 999]
 * Returns the input if the first version is provided ('0.0.1')
 *
 * @param {string} version
 * @returns {string}
 */
export const getPreviousVersion = version => {
  if (version === '0.0.1') {
    return version;
  }

  const decreaseLevel = (nextLevel, level) =>
    level > 0 ? [nextLevel, level - 1] : [nextLevel - 1, 999];

  let [major, minor, patch] = version.split('.').map(part => parseInt(part, 10));
  [minor, patch] = decreaseLevel(minor, patch);
  if (minor < 0) {
    [major, minor] = decreaseLevel(major, minor);
  }

  return [major, minor, patch].join('.');
};
