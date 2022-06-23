/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { SqlQuery } from '@tupaia/database';
import semverCompare from 'semver-compare';

export const PERMISSIONS_BASED_SYNC_MIN_APP_VERSION = '1.12.123';

export const supportsPermissionsBasedSync = version =>
  semverCompare(version, PERMISSIONS_BASED_SYNC_MIN_APP_VERSION) >= 0;

export const getCountriesAndPermissionsToSync = async req => {
  const { accessPolicy } = req;
  const {
    appVersion,
    countriesSynced: countriesSyncedString,
    permissionGroupsSynced: permissionGroupsSyncedString,
  } = req.query;

  if (!supportsPermissionsBasedSync(appVersion)) {
    throw new Error(
      `Permissions based sync is not supported for appVersion: ${appVersion}, must be ${PERMISSIONS_BASED_SYNC_MIN_APP_VERSION} or higher`,
    );
  }

  const usersCountries = accessPolicy.getEntitiesAllowed();
  const usersPermissionGroups = accessPolicy.getPermissionGroups();

  // First time sync, just return new countries and permission groups
  if (!countriesSyncedString || !permissionGroupsSyncedString) {
    const userCountryIds = (await req.models.country.find({ code: usersCountries })).map(
      country => country.id,
    );
    return {
      unsynced: {
        countries: usersCountries,
        countryIds: userCountryIds,
        permissionGroups: usersPermissionGroups,
      },
    };
  }

  const syncedCountries = countriesSyncedString.split(',');
  const syncedPermissionGroups = permissionGroupsSyncedString.split(',');
  const syncedCountryIds = (await req.models.country.find({ code: syncedCountries })).map(
    country => country.id,
  );

  const unsyncedCountries = usersCountries.filter(country => !syncedCountries.includes(country));
  const unsyncedPermissionGroups = usersPermissionGroups.filter(
    permissionGroup => !syncedPermissionGroups.includes(permissionGroup),
  );

  if (unsyncedCountries.length === 0 && unsyncedPermissionGroups.length === 0) {
    // No new countries or permissionGroups, just return synced
    return {
      synced: {
        countries: syncedCountries,
        countryIds: syncedCountryIds,
        permissionGroups: syncedPermissionGroups,
      },
    };
  }

  const unsyncedCountryIds = (await req.models.country.find({ code: unsyncedCountries })).map(
    country => country.id,
  );

  return {
    unsynced: {
      countries: unsyncedCountries,
      countryIds: unsyncedCountryIds,
      permissionGroups: unsyncedPermissionGroups,
    },
    synced: {
      countries: syncedCountries,
      countryIds: syncedCountryIds,
      permissionGroups: syncedPermissionGroups,
    },
  };
};

export const getPermissionsWhereClause = permissionsBasedFilter => {
  let query = '';
  const params = [];
  const { countries, countryIds, permissionGroups } = permissionsBasedFilter;
  const typesWithoutPermissions = ['country', 'permission_group']; // Sync all countries and permission groups (needed for requesting access)
  const permissionsClauses = [
    {
      query: `"type" = ? AND record_type IN ${SqlQuery.record(typesWithoutPermissions)}`,
      params: ['update', ...typesWithoutPermissions],
    },
    {
      query: `entity_type = ?`, // Sync all country entities (needed for requesting access to countries)
      params: ['country'],
    },
    {
      query: `entity_country = ANY(${SqlQuery.array(countries, 'text')})`,
      params: [...countries],
    },
    {
      query: `clinic_country = ANY(${SqlQuery.array(countries, 'text')}::text[])`,
      params: [...countries],
    },
    {
      query: `geographical_area_country = ANY(${SqlQuery.array(countries, 'text')}::text[])`,
      params: [...countries],
    },
    {
      query: `survey_permissions && ${SqlQuery.array(
        permissionGroups,
        'text',
      )}::text[] AND survey_countries && ${SqlQuery.array(countryIds, 'text')}::text[]`,
      params: [...permissionGroups, ...countryIds],
    },
    {
      query: `survey_group_permissions && ${SqlQuery.array(
        permissionGroups,
        'text',
      )}::text[] AND survey_group_countries && ${SqlQuery.array(countryIds, 'text')}`,
      params: [...permissionGroups, ...countryIds],
    },
    {
      query: `survey_screen_permissions && ${SqlQuery.array(
        permissionGroups,
        'text',
      )} AND survey_screen_countries && ${SqlQuery.array(countryIds, 'text')}`,
      params: [...permissionGroups, ...countryIds],
    },
    {
      query: `survey_screen_component_permissions && ${SqlQuery.array(
        permissionGroups,
        'text',
      )} AND survey_screen_component_countries && ${SqlQuery.array(countryIds, 'text')}`,
      params: [...permissionGroups, ...countryIds],
    },
    {
      query: `question_permissions && ${SqlQuery.array(
        permissionGroups,
        'text',
      )} AND question_countries && ${SqlQuery.array(countryIds, 'text')}`,
      params: [...permissionGroups, ...countryIds],
    },
    {
      query: `option_set_permissions && ${SqlQuery.array(
        permissionGroups,
        'text',
      )} AND option_set_countries && ${SqlQuery.array(countryIds, 'text')}`,
      params: [...permissionGroups, ...countryIds],
    },
    {
      query: `option_permissions && ${SqlQuery.array(
        permissionGroups,
        'text',
      )} AND option_countries && ${SqlQuery.array(countryIds, 'text')}`,
      params: [...permissionGroups, ...countryIds],
    },
  ];

  permissionsClauses.forEach(({ query: permClauseQuery, params: permClauseParams }, index) => {
    query = query.concat(`
            ${index !== 0 ? 'OR ' : ''}(${permClauseQuery})
          `);
    params.push(...permClauseParams);
  });

  return { query, params };
};
