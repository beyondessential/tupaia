import {
  DebugLogModel as BaseDebugLogModel,
  DebugLogRecord as BaseDebugLogRecord,
} from '@tupaia/database';
import { DebugLog } from '@tupaia/types';
import { Model } from './types';

export interface DebugLogRecord extends DebugLog, BaseDebugLogRecord {}

export interface DebugLogModel extends Model<BaseDebugLogModel, DebugLog, DebugLogRecord> {}
