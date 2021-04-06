/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry } from '@tupaia/database';
import { AncestorDescendantRelationModel, EntityModel, EntityHierarchyModel } from './models';

export interface EntityServerModelRegistry extends ModelRegistry {
  readonly ancestorDescendantRelation: AncestorDescendantRelationModel;
  readonly entity: EntityModel;
  readonly entityHierarchy: EntityHierarchyModel;
}

export type Resolved<T> = T extends Promise<infer R> ? R : T; // Returns resolved type if type is promise
