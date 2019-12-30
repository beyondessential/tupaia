/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

const cache = {};

export const getSiblingItems = (parentOrgUnitCode, siblingOrgUnitCode) => {
  if (!parentOrgUnitCode) return [];
  if (!cache[parentOrgUnitCode]) return [];

  // Filter out the current org unit from the cache.
  const siblings = cache[parentOrgUnitCode];
  return siblings.filter(value => value.organisationUnitCode !== siblingOrgUnitCode);
};

export const storeSiblingItems = (parentOrgUnitCode, siblingItems) => {
  if (!parentOrgUnitCode) {
    return;
  }

  cache[parentOrgUnitCode] = siblingItems;
};
