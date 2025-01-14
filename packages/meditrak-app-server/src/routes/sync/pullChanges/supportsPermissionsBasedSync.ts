import semverCompare from 'semver-compare';

export const PERMISSIONS_BASED_SYNC_MIN_APP_VERSION = '1.12.124';

export const supportsPermissionsBasedSync = (version: string) =>
  semverCompare(version, PERMISSIONS_BASED_SYNC_MIN_APP_VERSION) >= 0;
