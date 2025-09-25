import {
  FacilityModel as BaseFacilityModel,
  FacilityRecord as BaseFacilityRecord,
} from '@tupaia/database';
import { Clinic } from '@tupaia/types';
import { Model } from './types';

export interface FacilityRecord extends Clinic, BaseFacilityRecord {}

export interface FacilityModel extends Model<BaseFacilityModel, Clinic, FacilityRecord> {}
