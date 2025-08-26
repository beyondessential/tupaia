import {
  EntityParentChildRelationModel as BaseEntityParentChildRelationModel,
  EntityParentChildRelationRecord as BaseEntityParentChildRelationRecord,
} from '@tupaia/database';
import { EntityParentChildRelation } from '@tupaia/types';
import { Model } from './types';

export interface EntityParentChildRelationRecord
  extends EntityParentChildRelation,
    BaseEntityParentChildRelationRecord {}

export interface EntityParentChildRelationModel
  extends Model<
    BaseEntityParentChildRelationModel,
    EntityParentChildRelation,
    EntityParentChildRelationRecord
  > {}
