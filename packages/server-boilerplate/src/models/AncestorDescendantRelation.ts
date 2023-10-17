/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  AncestorDescendantRelationModel as BaseAncestorDescendantRelationModel,
  AncestorDescendantRelationType as BaseAncestorDescendantRelationType,
} from '@tupaia/database';
import { AncestorDescendantRelation, Entity } from '@tupaia/types';
import { Model, DbFilter, Joined } from './types';

type AncestorDescendantRelationFields = AncestorDescendantRelation &
  Joined<Entity, 'ancestor'> &
  Joined<Entity, 'descendant'>;

export interface AncestorDescendantRelationType
  extends AncestorDescendantRelationFields,
    BaseAncestorDescendantRelationType {}

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
