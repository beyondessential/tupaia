/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import {
  MapOverlayGroupRelationModel as BaseRelationModel,
  MapOverlayGroupRelationType as BaseRelationType,
} from '@tupaia/database';
import { MapOverlayGroupRelation } from '@tupaia/types';
import { Model } from './types';

export interface MapOverlayGroupRelationType extends MapOverlayGroupRelation, BaseRelationType {}

export interface MapOverlayGroupRelationModel
  extends Model<BaseRelationModel, MapOverlayGroupRelation, MapOverlayGroupRelationType> {
  findParentRelationTree: (childIds: string[]) => Promise<MapOverlayGroupRelationType[]>;
}
