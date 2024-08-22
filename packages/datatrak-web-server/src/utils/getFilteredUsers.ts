/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { Country, EntityType } from '@tupaia/types';
import { DatatrakWebServerModelRegistry } from '../types';
import { PermissionGroupRecord } from '@tupaia/server-boilerplate';
import { API_CLIENT_PERMISSIONS } from '../constants';

const USERS_EXCLUDED_FROM_LIST = [
  'edmofro@gmail.com', // Edwin
  'kahlinda.mahoney@gmail.com', // Kahlinda
  'lparish1980@gmail.com', // Lewis
  'sus.lake@gmail.com', // Susie
  'michaelnunan@hotmail.com', // Michael
  'vanbeekandrew@gmail.com', // Andrew
  'gerardckelly@gmail.com', // Gerry K
  'geoffreyfisher@hotmail.com', // Geoff F
  'josh@sussol.net', // mSupply API Client
  'unicef.laos.edu@gmail.com', // Laos Schools Data Collector
  'tamanu-server@tupaia.org', // Tamanu Server
  'public@tupaia.org', // Public User
];

const DEFAULT_PAGE_SIZE = 100;

export const getFilteredUsers = async (
  models: DatatrakWebServerModelRegistry,
  countryCode: Country['code'],
  permissionGroup: PermissionGroupRecord,
  searchTerm?: string,
) => {
  // get the ancestors of the permission group
  const permissionGroupWithAncestors = await permissionGroup.getAncestors();
  const entity = await models.entity.findOne({
    country_code: countryCode,
    type: EntityType.country,
  });

  const usersFilter = {
    email: { comparator: 'not in', comparisonValue: USERS_EXCLUDED_FROM_LIST },
    [QUERY_CONJUNCTIONS.RAW]: {
      // exclude E2E users and any internal users
      sql: `(email NOT LIKE '%tupaia.org' AND email NOT LIKE '%beyondessential.com.au' AND email NOT LIKE '%@bes.au')`,
    },
  } as Record<string, any>;

  if (searchTerm) {
    usersFilter.full_name = { comparator: 'ilike', comparisonValue: `${searchTerm}%` };
  }

  // if the permission group is a public permission group that every user has access to because of the api client permissions, then everyone has access to the survey, so return all non-internal users
  if (
    !API_CLIENT_PERMISSIONS.find(
      ({ entityCode, permissionGroupName }) =>
        entityCode === countryCode && permissionGroupName === permissionGroup.name,
    )
  ) {
    // get the user entity permissions for the permission group and its ancestors
    const userEntityPermissions = await models.userEntityPermission.find({
      permission_group_id: permissionGroupWithAncestors.map(p => p.id),
      entity_id: entity.id,
    });

    usersFilter.id = userEntityPermissions.map(uep => uep.user_id);
  }

  const users = await models.user.find(usersFilter, {
    sort: ['full_name ASC'],
    limit: DEFAULT_PAGE_SIZE,
  });

  return users.map(user => ({
    id: user.id,
    name: user.full_name,
  }));
};
