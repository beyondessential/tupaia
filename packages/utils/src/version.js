/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const getVersionParts = version => {
  const [major, minor, patch] = version.split('.').map(versionPart => parseInt(versionPart, 10));
  return { major, minor, patch };
};

/**
 * @param {string} versionA
 * @param {string} versionB
 * @returns {number} 1 if versionA is great, -1 if versionB is greater, 0 if equal
 */
export const compareMeditrakVersions = (versionA, versionB) => {
  const { patch: patchA } = getVersionParts(versionA);
  const { patch: patchB } = getVersionParts(versionB);

  // For the meditrak app, `patch` is always incremented by one when any version part changes
  // Eg v1.6.79 is followed by v1.7.80 (both `minor` and `patch` increment)
  if (patchA > patchB) {
    return 1;
  }
  return patchA < patchB ? -1 : 0;
};
