import {
  MapOverlayModel as BaseMapOverlayModel,
  MapOverlayRecord as BaseMapOverlayRecord,
} from '@tupaia/database';
import { MapOverlay } from '../models';
import { Model } from './types';

export interface MapOverlayRecord extends MapOverlay, BaseMapOverlayRecord {}

export interface MapOverlayModel extends Model<BaseMapOverlayModel, MapOverlay, MapOverlayRecord> {}
