/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  MapOverlayGroupModel as BaseMapOverlayGroupModel,
  MapOverlayGroupRecord as BaseMapOverlayGroupRecord,
} from '@tupaia/database';
import { MapOverlayGroup } from '@tupaia/types';
import { Model } from './types';

export interface MapOverlayGroupRecord extends MapOverlayGroup, BaseMapOverlayGroupRecord {}

export interface MapOverlayGroupModel
  extends Model<BaseMapOverlayGroupModel, MapOverlayGroup, MapOverlayGroupRecord> {}
