/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  EntityHierarchyModel as BaseEntityHierarchyModel,
  EntityHierarchyRecord as BaseEntityHierarchyRecord,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';

type EntityHierarchyFields = Readonly<{
  name: string;
  id: string;
}>;

interface EntityHierarchyRecord
  extends EntityHierarchyFields,
    Omit<BaseEntityHierarchyRecord, 'id'> {} // Omit base `id: any` type as we explicity define as a string here

export interface EntityHierarchyModel
  extends Model<BaseEntityHierarchyModel, EntityHierarchyFields, EntityHierarchyRecord> {}
