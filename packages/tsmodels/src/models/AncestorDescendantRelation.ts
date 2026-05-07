import {
  AncestorDescendantRelationModel as BaseAncestorDescendantRelationModel,
  AncestorDescendantRelationRecord as BaseAncestorDescendantRelationRecord,
} from '@tupaia/database';
import { AncestorDescendantRelation } from '@tupaia/types';
import { Model } from './types';

type AncestorDescendantRelationFields = AncestorDescendantRelation;

export interface AncestorDescendantRelationRecord
  extends AncestorDescendantRelationFields,
    BaseAncestorDescendantRelationRecord {}

export interface AncestorDescendantRelationModel
  extends Model<
    BaseAncestorDescendantRelationModel,
    AncestorDescendantRelationFields,
    AncestorDescendantRelationRecord
  > {}
