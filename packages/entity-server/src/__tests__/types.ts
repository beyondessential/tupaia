/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  ModelRegistry,
  EntityModel,
  EntityHierarchyModel,
  EntityRelationModel,
  UserEntityPermissionModel,
  UserModel,
  ProjectModel,
} from '@tupaia/database';

export interface TestModelRegistry extends ModelRegistry {
  readonly entity: EntityModel;
  readonly entityHierarchy: EntityHierarchyModel;
  readonly entityRelation: EntityRelationModel;
  readonly user: UserModel;
  readonly userEntityPermission: UserEntityPermissionModel;
  readonly project: ProjectModel;
}
