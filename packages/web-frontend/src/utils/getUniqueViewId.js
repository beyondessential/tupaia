/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

export const getUniqueViewId = ({ organisationUnitCode, dashboardGroupId, viewId }) =>
  [organisationUnitCode, dashboardGroupId, viewId].join('___');

export const getInfoFromInfoViewKey = infoViewKey => {
  if (!infoViewKey) return {};
  const [organisationUnitCode, dashboardGroupId, viewId] = infoViewKey.split('___');
  return { organisationUnitCode, dashboardGroupId, viewId };
};

export const getViewIdFromInfoViewKey = infoViewKey =>
  getInfoFromInfoViewKey(infoViewKey).viewId || null;
