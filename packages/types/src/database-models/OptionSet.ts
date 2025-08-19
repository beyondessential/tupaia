import {
  OptionSetModel as BaseOptionSetModel,
  OptionSetRecord as BaseOptionSetRecord,
} from '@tupaia/database';
import { OptionSet } from '../types/models';
import { Model } from './types';

export interface OptionSetRecord extends OptionSet, BaseOptionSetRecord {}

export interface OptionSetModel extends Model<BaseOptionSetModel, OptionSet, OptionSetRecord> {}
