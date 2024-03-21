/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  EntityHierarchyModel as BaseEntityHierarchyModel,
  EntityHierarchyRecord as BaseEntityHierarchyRecord,
} from '@tupaia/database';
import { EntityHierarchy } from '@tupaia/types';
import { Model } from './types';

export interface EntityHierarchyRecord extends EntityHierarchy, BaseEntityHierarchyRecord {}

export interface EntityHierarchyModel
  extends Model<BaseEntityHierarchyModel, EntityHierarchy, EntityHierarchyRecord> {}
