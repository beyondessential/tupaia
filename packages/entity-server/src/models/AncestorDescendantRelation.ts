/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  AncestorDescendantRelationModel as BaseAncestorDescendantRelationModel,
  AncestorDescendantRelationType as BaseAncestorDescendantRelationType,
} from '@tupaia/database';
import { Model } from './types';

export type AncestorDescendantRelationFields = Readonly<{
  id: string;
  entity_hierarchy_id: string;
  generational_distance: number;
}>;

export interface AncestorDescendantRelationType
  extends AncestorDescendantRelationFields,
    Omit<BaseAncestorDescendantRelationType, 'id'> {} // Omit base `id: any` type as we explicity define as a string here

export interface AncestorDescendantRelationModel
  extends Model<
    BaseAncestorDescendantRelationModel,
    AncestorDescendantRelationFields,
    AncestorDescendantRelationType
  > {}
