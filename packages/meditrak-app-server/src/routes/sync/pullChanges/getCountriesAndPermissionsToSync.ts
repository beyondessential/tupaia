import { Request } from 'express';

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
export const getCountriesAndPermissionsToSync = async (req: Request) => {
  const usersCountries = req.accessPolicy ? req.accessPolicy.getEntitiesAllowed() : [];
  const usersPermissionGroups = req.accessPolicy ? req.accessPolicy.getPermissionGroups() : [];

  const { countriesSynced, permissionGroupsSynced } = req.query;

  const syncedCountries = typeof countriesSynced === 'string' ? countriesSynced.split(',') : [];
  const syncedPermissionGroups =
    typeof permissionGroupsSynced === 'string' ? permissionGroupsSynced.split(',') : [];

  // First time sync, just return new countries and permission groups
  if (syncedCountries.length === 0 || syncedPermissionGroups.length === 0) {
    const userCountryIds = (await req.models.country.find({ code: usersCountries })).map(
      country => country.id,
    );
    return {
      synced: {},
      unsynced: {
        countries: usersCountries,
        countryIds: userCountryIds,
        permissionGroups: usersPermissionGroups,
      },
    };
  }

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
      unsynced: {},
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
      countries: unsyncedCountries.length === 0 ? undefined : unsyncedCountries,
      countryIds: unsyncedCountryIds.length === 0 ? undefined : unsyncedCountryIds,
      permissionGroups:
        unsyncedPermissionGroups.length === 0 ? undefined : unsyncedPermissionGroups,
    },
    synced: {
      countries: syncedCountries,
      countryIds: syncedCountryIds,
      permissionGroups: syncedPermissionGroups,
    },
  };
};
