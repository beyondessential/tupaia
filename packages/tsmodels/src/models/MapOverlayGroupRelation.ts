import {
  MapOverlayGroupRelationModel as BaseMapOverlayGroupRelationModel,
  MapOverlayGroupRelationRecord as BaseMapOverlayGroupRelationType,
} from '@tupaia/database';
import { MapOverlayGroupRelation } from '@tupaia/types';
import { Model } from './types';

export interface MapOverlayGroupRelationRecord
  extends MapOverlayGroupRelation,
    BaseMapOverlayGroupRelationType {}

export interface MapOverlayGroupRelationModel
  extends Model<
    BaseMapOverlayGroupRelationModel,
    MapOverlayGroupRelation,
    MapOverlayGroupRelationRecord
  > {
  findParentRelationTree: (childIds: string[]) => Promise<MapOverlayGroupRelationRecord[]>;
}
