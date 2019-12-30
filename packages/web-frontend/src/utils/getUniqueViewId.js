/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

export const getUniqueViewId = ({ organisationUnitCode, dashboardGroupId, viewId }) =>
  [organisationUnitCode, dashboardGroupId, viewId].join('_');
