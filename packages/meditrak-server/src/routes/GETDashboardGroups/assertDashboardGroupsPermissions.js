/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { keyBy } from 'lodash';
import { hasAccessToEntityForVisualisation } from '../utilities';
import { hasBESAdminAccess } from '../../permissions';

export const filterDashboardGroupsByPermissions = async (accessPolicy, models, dashboardGroups) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return dashboardGroups;
  }

  const allEntityCodes = [...new Set(dashboardGroups.map(dg => dg.organisationUnitCode))];
  const entities = await models.entity.find({ code: allEntityCodes });
  const entityByCode = keyBy(entities, 'code');
  const accessCache = {}; //Cache the access so that we don't have to recheck for some dashboard groups
  const filteredDashboardGroups = [];

  for (let i = 0; i < dashboardGroups.length; i++) {
    const dashboardGroup = dashboardGroups[i];
    const { userGroup: permissionGroup, organisationUnitCode } = dashboardGroup;
    const entity = entityByCode[dashboardGroup.organisationUnitCode];

    //permissionGroup and organisationUnitCode are the 2 values for checking access for a dashboard group
    //If there are multiple dashboardGroups having the same permissionGroup and organisationUnitCode, we can reuse the same access value.
    const cacheKey = `${permissionGroup}/${organisationUnitCode}`;
    let hasAccessToDashboardGroup = accessCache[cacheKey];

    if (hasAccessToDashboardGroup === undefined) {
      hasAccessToDashboardGroup = await hasAccessToEntityForVisualisation(
        accessPolicy,
        models,
        entity,
        permissionGroup,
      );
      accessCache[cacheKey] = hasAccessToDashboardGroup;
    }

    if (hasAccessToDashboardGroup) {
      filteredDashboardGroups.push(dashboardGroup);
    }
  }

  return filteredDashboardGroups;
};

export const assertDashboardGroupsPermissions = async (accessPolicy, models, dashboardGroups) => {
  const filteredDashboardGroups = await filterDashboardGroupsByPermissions(
    accessPolicy,
    models,
    dashboardGroups,
  );

  if (filteredDashboardGroups.length !== dashboardGroups.length) {
    throw new Error('You do not have permissions for the requested dashboard group(s)');
  }

  return true;
};
