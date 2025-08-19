import {
  LocalSystemFactModel as BaseLocalSystemFactModel,
  LocalSystemFactRecord as BaseLocalSystemFactRecord,
} from '@tupaia/database';
import { LocalSystemFact } from '../models';
import { Model } from './types';

export interface LocalSystemFactRecord extends LocalSystemFact, BaseLocalSystemFactRecord {}

export interface LocalSystemFactModel extends Model<BaseLocalSystemFactModel, LocalSystemFact, LocalSystemFactRecord> {}
