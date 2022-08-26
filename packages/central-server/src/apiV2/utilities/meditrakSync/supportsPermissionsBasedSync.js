/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import semverCompare from 'semver-compare';

export const PERMISSIONS_BASED_SYNC_MIN_APP_VERSION = '1.12.124';

export const supportsPermissionsBasedSync = version =>
  semverCompare(version, PERMISSIONS_BASED_SYNC_MIN_APP_VERSION) >= 0;
