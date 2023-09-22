/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';

// Takes an access policy and list of permission groups, generates the list of
// accessible countries
// Used to filter results from the entity server
export function generateAccessibleCountryList(
  accessPolicy: AccessPolicy,
  permissionGroups: string[],
) {
  const countryList: string[] = [];
  for (const group of permissionGroups) {
    countryList.push(...accessPolicy.getEntitiesAllowed(group));
  }
  // Return unique values
  return [...new Set(countryList)];
}
