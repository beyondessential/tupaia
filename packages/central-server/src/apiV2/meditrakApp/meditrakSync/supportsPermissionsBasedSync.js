import { compare } from 'compare-versions';

export const PERMISSIONS_BASED_SYNC_MIN_APP_VERSION = '1.12.124';

export const supportsPermissionsBasedSync = version =>
  compare(version, PERMISSIONS_BASED_SYNC_MIN_APP_VERSION, '>=');
