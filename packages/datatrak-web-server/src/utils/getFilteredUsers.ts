import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { Country, Project, EntityTypeEnum } from '@tupaia/types';
import { PermissionGroupRecord } from '@tupaia/server-boilerplate';
import { DatatrakWebServerModelRegistry } from '../types';
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

const usersFilter = {
  email: { comparator: 'not in', comparisonValue: USERS_EXCLUDED_FROM_LIST },
  [QUERY_CONJUNCTIONS.RAW]: {
    // exclude E2E users and any internal users
    sql: "(email NOT ILIKE '%@tupaia.org' AND email NOT ILIKE '%@bes.au' AND email NOT ILIKE '%@beyondessential.com.au')",
  },
} as Record<string, any>;

export const getFilteredUsers = async (
  models: DatatrakWebServerModelRegistry,
  searchTerm?: string,
  userIds?: string[],
) => {
  if (userIds) {
    usersFilter.id = userIds;
  }

  if (searchTerm) {
    usersFilter.full_name = { comparator: 'ilike', comparisonValue: `${searchTerm}%` };
  }

  const users = await models.user.find(usersFilter);

  // manually sort the users by full name, so that names beginning with special characters are first to match Meditrak
  return users
    .sort((a, b) => a.full_name.toLowerCase().localeCompare(b.full_name.toLowerCase()))
    .map(user => ({
      id: user.id,
      name: user.full_name,
    }))
    .slice(0, DEFAULT_PAGE_SIZE);
};

export const getFilteredUsersForPermissionGroup = async (
  models: DatatrakWebServerModelRegistry,
  countryCode: Country['code'],
  permissionGroup: PermissionGroupRecord,
  searchTerm?: string,
) => {
  // if the permission group is a public permission group that every user has access to because of the api client permissions, then everyone has access to the survey, so return all non-internal users
  if (
    API_CLIENT_PERMISSIONS.find(
      ({ entityCode, permissionGroupName }) =>
        entityCode === countryCode && permissionGroupName === permissionGroup.name,
    )
  ) {
    return getFilteredUsers(models, searchTerm);
  }

  // get the ancestors of the permission group
  const permissionGroupWithAncestors = await permissionGroup.getAncestors();
  const entity = await models.entity.findOne({
    country_code: countryCode,
    type: EntityTypeEnum.country,
  });

  // get the user entity permissions for the permission group and its ancestors
  const userEntityPermissions = await models.userEntityPermission.find({
    permission_group_id: permissionGroupWithAncestors.map(p => p.id),
    entity_id: entity.id,
  });

  const userIds = userEntityPermissions.map(uep => uep.user_id);

  return getFilteredUsers(models, searchTerm, userIds);
};
