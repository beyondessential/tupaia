import { ModelRegistry, UserModel, ReportModel, PermissionGroupModel } from '@tupaia/database';

export interface TestModelRegistry extends ModelRegistry {
  readonly user: UserModel;
  readonly report: ReportModel;
  readonly permissionGroup: PermissionGroupModel;
}
