/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { DataBrokerModelRegistry, DataElement, DataSource } from '../types';
import { fetchOrgUnitsByCountry } from './fetchOrgUnitsByCountry';

const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';

const getUserPermissions = (accessPolicy?: AccessPolicy, countryCodes?: string[]) => {
  return getPermissionListWithWildcard(accessPolicy, countryCodes);
};

const getPermissionListWithWildcard = (accessPolicy?: AccessPolicy, countryCodes?: string[]) => {
  // Get the users permission groups as a list of codes
  if (!accessPolicy) {
    return ['*'];
  }
  const userPermissionGroups = accessPolicy.getPermissionGroups(countryCodes);
  return ['*', ...userPermissionGroups];
};

export const checkDataElementPermissions = async (
  models: DataBrokerModelRegistry,
  dataElements: DataSource[],
  accessPolicy?: AccessPolicy,
  organisationUnitCodes?: string[],
) => {
  const allUserPermissions = getUserPermissions(accessPolicy);
  if (allUserPermissions.includes(BES_ADMIN_PERMISSION_GROUP)) {
    return organisationUnitCodes;
  }

  const getDataElementsWithMissingPermissions = (permissions: string[]) =>
    (dataElements as DataElement[])
      .filter(element => element.permission_groups.length > 0)
      .filter(element => !element.permission_groups.some(group => permissions.includes(group)))
      .map(element => element.code);

  if (!organisationUnitCodes) {
    const missingPermissions = getDataElementsWithMissingPermissions(allUserPermissions);
    if (missingPermissions.length > 0) {
      throw new Error(`Missing permissions to the following data elements: ${missingPermissions}`);
    }

    return organisationUnitCodes;
  }

  const organisationUnitsByCountry = await fetchOrgUnitsByCountry(models, organisationUnitCodes);
  const countryCodes = Object.keys(organisationUnitsByCountry);

  let organisationUnitsWithPermission: string[] = [];
  const countriesMissingPermission = Object.fromEntries(
    dataElements.map(({ code }) => [code, [] as string[]]),
  );
  countryCodes.forEach(country => {
    const missingPermissions = getDataElementsWithMissingPermissions(
      getUserPermissions(accessPolicy, [country]),
    );
    if (missingPermissions.length === 0) {
      // Have access to all data elements for country
      organisationUnitsWithPermission = organisationUnitsWithPermission.concat(
        organisationUnitsByCountry[country],
      );
    }

    missingPermissions.forEach(dataElement =>
      countriesMissingPermission[dataElement].push(country),
    );
  });

  if (organisationUnitsWithPermission.length === 0) {
    const dataElementsWithNoAccess = Object.entries(countriesMissingPermission)
      .filter(([, countries]) => countries.length === countryCodes.length)
      .map(([dataElement]) => dataElement);
    throw new Error(
      `Missing permissions to the following data elements:\n${dataElementsWithNoAccess}`,
    );
  }

  return organisationUnitsWithPermission;
};

export const checkDataGroupPermissions = async (
  models: DataBrokerModelRegistry,
  dataGroups: DataSource[],
  accessPolicy?: AccessPolicy,
  organisationUnitCodes?: string[],
) => {
  const missingPermissions = [];
  for (const group of dataGroups) {
    const dataElements = await models.dataGroup.getDataElementsInDataGroup(group.code);
    try {
      await checkDataElementPermissions(models, dataElements, accessPolicy, organisationUnitCodes);
    } catch {
      missingPermissions.push(group.code);
    }
  }
  if (missingPermissions.length === 0) {
    return organisationUnitCodes;
  }
  throw new Error(`Missing permissions to the following data groups: ${missingPermissions}`);
};

// No check for syncGroups currently
export const checkSyncGroupPermissions = async (
  models: DataBrokerModelRegistry,
  syncGroups: DataSource[],
  accessPolicy?: AccessPolicy,
  organisationUnitCodes?: string[],
) => {
  return organisationUnitCodes;
};
