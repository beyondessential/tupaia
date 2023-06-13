/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry } from '@tupaia/database';
import {
  AncestorDescendantRelationModel,
  EntityModel,
  EntityHierarchyModel,
  ProjectModel,
} from './models';

export interface EntityServerModelRegistry extends ModelRegistry {
  readonly ancestorDescendantRelation: AncestorDescendantRelationModel;
  readonly entity: EntityModel;
  readonly entityHierarchy: EntityHierarchyModel;
  readonly project: ProjectModel;
}

// Extracts keys that have object-like values from type T
export type ObjectLikeKeys<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? K : never;
}[keyof T];

// Extracts keys that have numeric values from type T
export type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

export type Writable<T> = { -readonly [field in keyof T]?: T[field] };

type SimpleKeys<T> = {
  [K in keyof T]: T[K] extends string | number | symbol ? K : never;
}[keyof T];

export type Flattable<T> = Pick<T, SimpleKeys<T>>;
export type Flattened<T> = Flattable<T>[keyof Flattable<T>];
