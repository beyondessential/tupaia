import {
  ModelRegistry,
  EntityModel,
  EntityHierarchyModel,
  EntityRelationModel,
  UserEntityPermissionModel,
  UserModel,
  ProjectModel,
  TupaiaDatabase,
} from '@tupaia/database';

export interface TestModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly entity: EntityModel;
  readonly entityHierarchy: EntityHierarchyModel;
  readonly entityRelation: EntityRelationModel;
  readonly user: UserModel;
  readonly userEntityPermission: UserEntityPermissionModel;
  readonly project: ProjectModel;
}
