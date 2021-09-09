/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

const SEPARATOR = '___';

export const getUniqueViewId = (organisationUnitCode, dashboardCode, itemCode) =>
  [organisationUnitCode, dashboardCode, itemCode].join(SEPARATOR);

export const getInfoFromInfoViewKey = infoViewKey => {
  if (!infoViewKey) return {};
  const [organisationUnitCode, dashboardCode, itemCode] = infoViewKey.split(SEPARATOR);
  return { organisationUnitCode, dashboardCode, itemCode };
};

export const getViewIdFromInfoViewKey = infoViewKey =>
  getInfoFromInfoViewKey(infoViewKey).itemCode || null;
