import {
  TombstoneModel as BaseTombstoneModel,
  TombstoneRecord as BaseTombstoneRecord,
} from '@tupaia/database';
import { Tombstone } from '@tupaia/types';
import { Model } from './types';

export interface TombstoneRecord extends BaseTombstoneRecord {}

export interface TombstoneModel extends Model<BaseTombstoneModel, Tombstone, TombstoneRecord> {}
