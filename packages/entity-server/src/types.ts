import { Knex } from 'knex';

import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import {
  AncestorDescendantRelationModel,
  EntityHierarchyModel,
  EntityModel,
  ProjectModel,
} from '@tupaia/server-boilerplate';

export interface EntityServerModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly ancestorDescendantRelation: AncestorDescendantRelationModel;
  readonly entity: EntityModel;
  readonly entityHierarchy: EntityHierarchyModel;
  readonly project: ProjectModel;

  wrapInTransaction<T = unknown>(
    wrappedFunction: (models: EntityServerModelRegistry) => Promise<T>,
    transactionConfig?: Knex.TransactionConfig,
  ): Promise<T>;
  wrapInReadOnlyTransaction<T = unknown>(
    wrappedFunction: (models: EntityServerModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'readOnly'>,
  ): Promise<T>;
  wrapInRepeatableReadTransaction<T = unknown>(
    wrappedFunction: (models: EntityServerModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'isolationLevel'>,
  ): Promise<T>;
}

type SimpleKeys<T> = {
  [K in keyof T]: T[K] extends string | number | symbol ? K : never;
}[keyof T];

export type Flattable<T> = Pick<T, SimpleKeys<T>>;
export type Flattened<T> = Flattable<T>[keyof Flattable<T>];
