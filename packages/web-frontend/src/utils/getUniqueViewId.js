/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

export const getUniqueViewId = ({ organisationUnitCode, dashboardGroupId, viewId }) =>
  [organisationUnitCode, dashboardGroupId, viewId].join('___');

export const getViewIdFromInfoViewKey = infoViewKey => {
  const infoViewKeyParams = infoViewKey.split('___');
  if (infoViewKeyParams && infoViewKeyParams.length === 3) return infoViewKeyParams[2];
  return null;
};
