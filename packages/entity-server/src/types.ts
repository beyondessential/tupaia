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

// Returns resolved type if type is promise
export type Resolved<T> = T extends Promise<infer R> ? R : T;

// Extracts keys that have object-like values from type T
export type ObjectLikeKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends Record<string, any> ? K : never;
}[keyof T];

export type Writable<T> = { -readonly [field in keyof T]?: T[field] };
