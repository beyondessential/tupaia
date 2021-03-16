/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry } from '@tupaia/database';
import { EntityModel, EntityHierarchyModel } from './models';

export interface EntityServerModelRegistry extends ModelRegistry {
  readonly entity: EntityModel;
  readonly entityHierarchy: EntityHierarchyModel;
}

export type Context<T> = {
  [field in keyof T]: T[field];
};
