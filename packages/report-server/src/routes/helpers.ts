/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import type { TupaiaApiClient } from '@tupaia/api-client';
import { AccessPolicy } from '@tupaia/access-policy';

export const getAccessibleOrgUnitCodes = (
  permissionGroupName: string,
  foundOrgUnits: { country_code: string | null; code: string }[],
  accessPolicy: AccessPolicy,
) => {
  const accessibleOrgUnits = foundOrgUnits.filter(
    ({ country_code: countryCode }) =>
      countryCode !== null && accessPolicy.allows(countryCode, permissionGroupName),
  );
  if (accessibleOrgUnits.length === 0) {
    throw new Error(
      `No '${permissionGroupName}' permissions to any one of entities: ${foundOrgUnits.map(
        orgUnit => orgUnit.code,
      )}`,
    );
  }
  return accessibleOrgUnits.map(orgUnit => orgUnit.code);
};

export const getRequestedOrgUnitObjects = async (
  hierarchy: string,
  orgUnitCodes: string | string[],
  entityApi: TupaiaApiClient['entity'],
) => {
  const orgUnitCodesInArray = Array.isArray(orgUnitCodes) ? orgUnitCodes : orgUnitCodes.split(',');

  const entities = await entityApi.getEntities(hierarchy, orgUnitCodesInArray, {
    fields: ['code', 'country_code', 'type'],
  });
  if (entities.length === 0) {
    throw new Error(`No entities found with codes ${orgUnitCodesInArray}`);
  }

  if (entities.length === 1 && entities[0].type === 'project') {
    const countryEntities = await entityApi.getDescendantsOfEntities(
      hierarchy,
      orgUnitCodesInArray,
      {
        fields: ['code', 'country_code', 'type'],
        filter: { type: 'country' },
      },
      false,
    );

    return countryEntities;
  }
  return entities;
};
