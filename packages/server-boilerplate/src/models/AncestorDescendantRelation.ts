/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  AncestorDescendantRelationModel as BaseAncestorDescendantRelationModel,
  AncestorDescendantRelationRecord as BaseAncestorDescendantRelationRecord,
} from '@tupaia/database';
import { AncestorDescendantRelation, Entity } from '@tupaia/types';
import { Model, DbFilter, Joined } from './types';

type AncestorDescendantRelationFields = Readonly<AncestorDescendantRelation> &
  Joined<Entity, 'ancestor'> &
  Joined<Entity, 'descendant'>;

interface AncestorDescendantRelationRecord
  extends AncestorDescendantRelationFields,
    Omit<BaseAncestorDescendantRelationRecord, 'id'> {} // Omit base `id: any` type as we explicity define as a string in the type definition

export interface AncestorDescendantRelationModel
  extends Model<
    BaseAncestorDescendantRelationModel,
    AncestorDescendantRelationFields,
    AncestorDescendantRelationRecord
  > {
  getImmediateRelations: (
    hierarchyId: string,
    criteria?: DbFilter<AncestorDescendantRelationFields>,
  ) => Promise<AncestorDescendantRelationRecord[]>;
}
