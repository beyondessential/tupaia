/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  EntityHierarchyModel as BaseEntityHierarchyModel,
  EntityHierarchyType as BaseEntityHierarchyType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';

export type EntityHierarchyFields = Readonly<{
  name: string;
  id: string;
}>;

export interface EntityHierarchyType
  extends EntityHierarchyFields,
    Omit<BaseEntityHierarchyType, 'id'> {} // Omit base `id: any` type as we explicity define as a string here

export interface EntityHierarchyModel
  extends Model<BaseEntityHierarchyModel, EntityHierarchyFields, EntityHierarchyType> {}
