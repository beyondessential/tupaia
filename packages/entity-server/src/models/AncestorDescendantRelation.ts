/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  AncestorDescendantRelationModel as BaseAncestorDescendantRelationModel,
  AncestorDescendantRelationType as BaseAncestorDescendantRelationType,
} from '@tupaia/database';
import { Model, DbFilter, Joined } from '@tupaia/server-boilerplate';
import { EntityFields } from './Entity';

export type AncestorDescendantRelationFields = Readonly<{
  id: string;
  entity_hierarchy_id: string;
  generational_distance: number;
}> &
  Joined<EntityFields, 'ancestor'> &
  Joined<EntityFields, 'descendant'>;

export interface AncestorDescendantRelationType
  extends AncestorDescendantRelationFields,
    Omit<BaseAncestorDescendantRelationType, 'id'> {} // Omit base `id: any` type as we explicity define as a string here

export interface AncestorDescendantRelationModel
  extends Model<
    BaseAncestorDescendantRelationModel,
    AncestorDescendantRelationFields,
    AncestorDescendantRelationType
  > {
  getImmediateRelations: (
    hierarchyId: string,
    criteria?: DbFilter<AncestorDescendantRelationFields>,
  ) => Promise<AncestorDescendantRelationType[]>;
}
