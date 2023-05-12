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

export type Writable<T> = { -readonly [field in keyof T]?: T[field] };
