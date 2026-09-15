import {
  ModelRegistry,
  EntityModel,
  UserEntityPermissionModel,
  UserModel,
  ProjectModel,
  TupaiaDatabase,
} from '@tupaia/database';

export interface TestModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly entity: EntityModel;
  readonly user: UserModel;
  readonly userEntityPermission: UserEntityPermissionModel;
  readonly project: ProjectModel;
}
