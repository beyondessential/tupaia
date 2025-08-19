import { OptionModel as BaseOptionModel, OptionRecord as BaseOptionRecord } from '@tupaia/database';
import { Option } from '../models';
import { Model } from './types';

export interface OptionRecord extends Option, BaseOptionRecord {}

export interface OptionModel extends Model<BaseOptionModel, Option, OptionRecord> {}
