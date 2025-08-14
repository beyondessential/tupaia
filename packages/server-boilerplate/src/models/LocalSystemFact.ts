import {
  LocalSystemFactModel as BaseLocalSystemFactModel,
  LocalSystemFactRecord as BaseLocalSystemFactRecord,
} from '@tupaia/database';
import { LocalSystemFact } from '@tupaia/types';
import { Model } from './types';

export interface LocalSystemFactRecord extends LocalSystemFact, BaseLocalSystemFactRecord {}

export interface LocalSystemFactModel extends Model<BaseLocalSystemFactModel, LocalSystemFact, LocalSystemFactRecord> {}
