import {
  AncestorDescendantRelationModel as BaseAncestorDescendantRelationModel,
  AncestorDescendantRelationRecord as BaseAncestorDescendantRelationRecord,
} from '@tupaia/database';
import { AncestorDescendantRelation, Entity } from '@tupaia/types';
import { Model, DbFilter, Joined } from './types';

type AncestorDescendantRelationFields = AncestorDescendantRelation &
  Joined<Entity, 'ancestor'> &
  Joined<Entity, 'descendant'>;

export interface AncestorDescendantRelationRecord
  extends AncestorDescendantRelationFields,
    BaseAncestorDescendantRelationRecord {}

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
