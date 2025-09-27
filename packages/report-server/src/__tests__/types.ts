import {
  ModelRegistry,
  PermissionGroupModel,
  ReportModel,
  TupaiaDatabase,
  UserModel,
} from '@tupaia/database';

export interface TestModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly user: UserModel;
  readonly report: ReportModel;
  readonly permissionGroup: PermissionGroupModel;
}
