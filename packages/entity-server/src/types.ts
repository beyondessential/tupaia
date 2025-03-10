import { ModelRegistry } from '@tupaia/database';
import {
  AncestorDescendantRelationModel,
  EntityHierarchyModel,
  EntityModel,
  ProjectModel,
} from '@tupaia/server-boilerplate';

export interface EntityServerModelRegistry extends ModelRegistry {
  readonly ancestorDescendantRelation: AncestorDescendantRelationModel;
  readonly entity: EntityModel;
  readonly entityHierarchy: EntityHierarchyModel;
  readonly project: ProjectModel;
}

export type Writable<T> = { -readonly [field in keyof T]?: T[field] };

type SimpleKeys<T> = {
  [K in keyof T]: T[K] extends string | number | symbol ? K : never;
}[keyof T];

export type Flattable<T> = Pick<T, SimpleKeys<T>>;
export type Flattened<T> = Flattable<T>[keyof Flattable<T>];
