import {
  TombstoneRecord as BaseTombstoneRecord,
  TombstoneModel as BaseTombstoneModel,
} from '@tupaia/database';
import { Tombstone } from '../types/models';
import { Model } from './types';

export interface TombstoneRecord extends Tombstone, BaseTombstoneRecord {}

export interface TombstoneModel extends Model<BaseTombstoneModel, Tombstone, TombstoneRecord> {}
