import {
  OptionSetModel as BaseOptionSetModel,
  OptionSetRecord as BaseOptionSetRecord,
} from '@tupaia/database';
import { OptionSet } from '@tupaia/types';
import { Model } from './types';

export interface OptionSetRecord extends OptionSet, BaseOptionSetRecord {}

export interface OptionSetModel extends Model<BaseOptionSetModel, OptionSet, OptionSetRecord> {}
