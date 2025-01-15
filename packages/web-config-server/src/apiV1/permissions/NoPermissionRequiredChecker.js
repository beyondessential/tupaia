import { PermissionsChecker } from './PermissionsChecker';

// a blank permissions checker that allows passing straight through
export class NoPermissionRequiredChecker extends PermissionsChecker {
  checkPermissions() {}
}
