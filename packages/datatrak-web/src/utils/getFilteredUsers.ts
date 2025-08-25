import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { DbFilter, PermissionGroupRecord } from '@tupaia/tsmodels';
import { Country, EntityTypeEnum, UserAccount } from '@tupaia/types';

import { DatatrakWebModelRegistry } from '../types';

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

export const TUPAIA_ADMIN_PANEL_PERMISSION_GROUP = 'Tupaia Admin Panel';

export const API_CLIENT_PERMISSIONS = [
  { entityCode: 'DL', permissionGroupName: 'Public' }, //	Demo Land
  { entityCode: 'FJ', permissionGroupName: 'Public' }, //	Fiji
  { entityCode: 'CK', permissionGroupName: 'Public' }, //	Cook Islands
  { entityCode: 'PG', permissionGroupName: 'Public' }, //	Papua New Guinea
  { entityCode: 'SB', permissionGroupName: 'Public' }, //	Solomon Islands
  { entityCode: 'TK', permissionGroupName: 'Public' }, //	Tokelau
  { entityCode: 'VE', permissionGroupName: 'Public' }, //	Venezuela
  { entityCode: 'WS', permissionGroupName: 'Public' }, //	Samoa
  { entityCode: 'KI', permissionGroupName: 'Public' }, //	Kiribati
  { entityCode: 'TO', permissionGroupName: 'Public' }, //	Tonga
  { entityCode: 'NG', permissionGroupName: 'Public' }, //	Nigeria
  { entityCode: 'VU', permissionGroupName: 'Public' }, //	Vanuatu
  { entityCode: 'AU', permissionGroupName: 'Public' }, //	Australia
  { entityCode: 'PW', permissionGroupName: 'Public' }, //	Palau
  { entityCode: 'NU', permissionGroupName: 'Public' }, //	Niue
  { entityCode: 'TV', permissionGroupName: 'Public' }, //	Tuvalu
];

const DEFAULT_PAGE_SIZE = 100;

interface UserAccountWithCustomColumns extends UserAccount {
  full_name: string;
}

export const getFilteredUsers = async (
  models: DatatrakWebModelRegistry,
  searchTerm?: string,
  userIds?: string[],
) => {
  const usersFilter = {
    email: {
      comparator: 'not in',
      comparisonValue: USERS_EXCLUDED_FROM_LIST,
    },
    [QUERY_CONJUNCTIONS.RAW]: {
      // exclude E2E users and any internal users
      sql: "(email NOT ILIKE '%@tupaia.org' AND email NOT ILIKE '%@bes.au' AND email NOT ILIKE '%@beyondessential.com.au')",
    },
  } as unknown as DbFilter<UserAccountWithCustomColumns>;

  if (userIds) {
    usersFilter.id = userIds;
  }

  if (searchTerm) {
    usersFilter.full_name = { comparator: 'ilike', comparisonValue: `${searchTerm}%` };
  }

  const users = await models.user.find(usersFilter);

  // manually sort the users by full name, so that names beginning with special characters are first to match Meditrak
  return users
    .sort((a, b) => a.full_name.toLocaleUpperCase().localeCompare(b.full_name.toLocaleUpperCase()))
    .slice(0, DEFAULT_PAGE_SIZE)
    .map(user => ({
      id: user.id,
      name: user.full_name,
    }));
};

export const getFilteredUsersForPermissionGroup = async (
  models: DatatrakWebModelRegistry,
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
  const [permissionGroupWithAncestors, entity] = await Promise.all([
    permissionGroup.getAncestors(),
    models.entity.findOne({
      country_code: countryCode,
      type: EntityTypeEnum.country,
    }),
  ]);

  // get the user entity permissions for the permission group and its ancestors
  const userEntityPermissions = await models.userEntityPermission.find({
    permission_group_id: permissionGroupWithAncestors.map(p => p.id),
    entity_id: entity.id,
  });

  const userIds = userEntityPermissions.map(uep => uep.user_id);

  return getFilteredUsers(models, searchTerm, userIds);
};
