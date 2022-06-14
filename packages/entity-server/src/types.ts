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

// Extracts keys that have object-like values from type T
export type ObjectLikeKeys<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? K : never;
}[keyof T];

export type Writable<T> = { -readonly [field in keyof T]?: T[field] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

// Flattens nested object to shallow object with keys joined by J
// eg. Flatten<{ cat: { cute: true } }, '_is_'> => { cat_is_cute: true }
export type Flatten<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, Record<string, any>>,
  J extends string = '.',
  K extends keyof T & string = keyof T & string
> = UnionToIntersection<
  {
    [V in K]: { [field in keyof T[V] & string as `${V}${J}${field}`]: T[V][field] };
  }[K]
>;
