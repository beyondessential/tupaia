/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { PermissionsChecker } from './PermissionsChecker';

// a blank permissions checker that allows passing straight through
export class NoPermissionRequiredChecker extends PermissionsChecker {
  checkPermissions() {}
}
