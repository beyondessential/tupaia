import { AccessPolicy } from '@tupaia/access-policy';
import { DataBrokerModelRegistry, DataElement, DataGroup } from '../types';
import { fetchOrgUnitsByCountry } from './fetchOrgUnitsByCountry';

const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';

const getPermissionListWithWildcard = (accessPolicy?: AccessPolicy, countryCodes?: string[]) => {
  // Get the users permission groups as a list of codes
  if (!accessPolicy) {
    return ['*'];
  }
  const userPermissionGroups = accessPolicy.getPermissionGroups(countryCodes);
  return ['*', ...userPermissionGroups];
};

export const fetchAllowedOrgUnitsForDataElements = async (
  models: DataBrokerModelRegistry,
  dataElements: DataElement[],
  accessPolicy?: AccessPolicy,
  orgUnitCodes?: string[],
) => {
  const allUserPermissions = getPermissionListWithWildcard(accessPolicy);
  if (allUserPermissions.includes(BES_ADMIN_PERMISSION_GROUP)) {
    return orgUnitCodes;
  }

  const getDataElementsWithMissingPermissions = (permissions: string[]) =>
    (dataElements as DataElement[])
      .filter(element => element.permission_groups.length > 0)
      .filter(element => !element.permission_groups.some(group => permissions.includes(group)))
      .map(element => element.code);

  if (!orgUnitCodes) {
    const missingPermissions = getDataElementsWithMissingPermissions(allUserPermissions);
    if (missingPermissions.length > 0) {
      throw new Error(`Missing permissions to the following data elements: ${missingPermissions}`);
    }

    return orgUnitCodes;
  }

  const orgUnitsByCountry = await fetchOrgUnitsByCountry(models, orgUnitCodes);
  const countryCodes = Object.keys(orgUnitsByCountry);

  let allowedOrgUnits: string[] = [];
  const countriesMissingPermission = Object.fromEntries(
    dataElements.map(({ code }) => [code, [] as string[]]),
  );
  countryCodes.forEach(country => {
    const missingPermissions = getDataElementsWithMissingPermissions(
      getPermissionListWithWildcard(accessPolicy, [country]),
    );
    if (missingPermissions.length === 0) {
      // Have access to all data elements for country
      allowedOrgUnits = allowedOrgUnits.concat(orgUnitsByCountry[country]);
    }

    missingPermissions.forEach(dataElement =>
      countriesMissingPermission[dataElement].push(country),
    );
  });

  if (allowedOrgUnits.length === 0) {
    const dataElementsWithNoAccess = Object.entries(countriesMissingPermission)
      .filter(([, countries]) => countries.length === countryCodes.length)
      .map(([dataElement]) => dataElement);
    throw new Error(
      `Missing permissions to the following data elements:\n${dataElementsWithNoAccess}`,
    );
  }

  return allowedOrgUnits;
};

export const fetchAllowedOrgUnitsForDataGroups = async (
  models: DataBrokerModelRegistry,
  dataGroups: DataGroup[],
  accessPolicy?: AccessPolicy,
  orgUnitCodes?: string[],
) => {
  const missingPermissions = [];
  for (const group of dataGroups) {
    const dataElements = await models.dataGroup.getDataElementsInDataGroup(group.code);
    try {
      await fetchAllowedOrgUnitsForDataElements(models, dataElements, accessPolicy, orgUnitCodes);
    } catch {
      missingPermissions.push(group.code);
    }
  }
  if (missingPermissions.length === 0) {
    return orgUnitCodes;
  }
  throw new Error(`Missing permissions to the following data groups: ${missingPermissions}`);
};
