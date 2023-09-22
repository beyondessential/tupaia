/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';

const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';

// Takes an access policy and list of permission groups, generates the list of
// accessible countries
// Used to filter results from the entity server
export function generateAccessibleCountryFilter(
  accessPolicy: AccessPolicy,
  permissionGroups: string[],
) {
  const countryList: string[] = [];

  if (accessPolicy.allowsAnywhere(BES_ADMIN_PERMISSION_GROUP)) {
    // Don't filter if we're an admin
    return {};
  }

  for (const group of permissionGroups) {
    countryList.push(...accessPolicy.getEntitiesAllowed(group));
  }
  // Return unique values
  return {
    country_code: {
      comparator: '=',
      comparisonValue: [...new Set(countryList)],
    },
  };
}
