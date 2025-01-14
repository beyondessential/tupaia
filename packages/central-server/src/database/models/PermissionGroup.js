import { PermissionGroupModel as CommonPermissionGroupModel } from '@tupaia/database';

export class PermissionGroupModel extends CommonPermissionGroupModel {
  meditrakConfig = {
    minAppVersion: '1.7.86',
  };
}
