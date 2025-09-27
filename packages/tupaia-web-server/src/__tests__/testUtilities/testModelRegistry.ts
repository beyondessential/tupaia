import {
  EntityHierarchyModel,
  EntityModel,
  EntityRelationModel,
  ModelRegistry,
  PermissionGroupModel,
  TupaiaDatabase,
  UserEntityPermissionModel,
  UserModel,
} from '@tupaia/database';

export interface TestModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly entity: EntityModel;
  readonly entityHierarchy: EntityHierarchyModel;
  readonly entityRelation: EntityRelationModel;
  readonly user: UserModel;
  readonly userEntityPermission: UserEntityPermissionModel;
  readonly permissionGroup: PermissionGroupModel;
}
