import {
  ModelRegistry,
  EntityModel,
  EntityHierarchyModel,
  EntityRelationModel,
  UserEntityPermissionModel,
  UserModel,
  PermissionGroupModel,
} from '@tupaia/database';

export interface TestModelRegistry extends ModelRegistry {
  readonly entity: EntityModel;
  readonly entityHierarchy: EntityHierarchyModel;
  readonly entityRelation: EntityRelationModel;
  readonly user: UserModel;
  readonly userEntityPermission: UserEntityPermissionModel;
  readonly permissionGroup: PermissionGroupModel;
}
