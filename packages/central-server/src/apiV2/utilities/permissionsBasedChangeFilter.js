/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { SqlQuery } from '@tupaia/database';
import semverCompare from 'semver-compare';

export const PERMISSIONS_BASED_SYNC_MIN_APP_VERSION = '1.12.123';

export const supportsPermissionsBasedSync = version =>
  semverCompare(version, PERMISSIONS_BASED_SYNC_MIN_APP_VERSION) >= 0;

/**
 * This function determines which countries and permissions should be synced to a given meditrak app
 * based on what previously been synced to it, and what data the user has access to
 *
 * Returns:
 * {
 *   synced: Countries/permission groups that have already been synced to the device,
 *   unsynced: Countries/permission groups that have not yet been synced to the device but need to be (eg. for a new user log in, or if permissions for the user have changed)
 * }
 *
 * synced countries/permissions should only have new updates/deletes (ie. later than 'since' timestamp) included in the changes
 * unsynced countries/permissions should all updates/deletes synced to the device.
 */
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
  const { countryIds, permissionGroups } = permissionsBasedFilter;
  const typesWithoutPermissions = ['country', 'permission_group']; // Sync all countries and permission groups (needed for requesting access)
  const clauses = [
    {
      query: `"type" = ? AND record_type IN ${SqlQuery.record(typesWithoutPermissions)}`,
      params: ['update', ...typesWithoutPermissions],
    },
    {
      query: `entity_type = ?`, // Sync all country entities (needed regardless of user permissions for requesting access to countries)
      params: ['country'],
    },
    {
      // Sync updates where the country and permissions are NULL or they intersect with the allowed countries and permission groups
      query: `"type" = ? 
        AND (country_ids IS NULL OR country_ids && ${SqlQuery.array(countryIds, 'text')}) 
        AND (permission_groups IS NULL OR permission_groups && ${SqlQuery.array(
          permissionGroups,
          'text',
        )})`,
      params: ['update', ...countryIds, ...permissionGroups],
    },
  ];

  clauses.forEach(({ query: clauseQuery, params: clauseParams }, index) => {
    query = query.concat(`
            ${index !== 0 ? 'OR ' : ''}(${clauseQuery})
          `);
    params.push(...clauseParams);
  });

  return { query, params };
};
