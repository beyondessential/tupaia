/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  ApiRequestLogModel as BaseApiRequestLogModel,
  ApiRequestLogRecord as BaseApiRequestLogRecord,
} from '@tupaia/database';
import { ApiRequestLog } from '@tupaia/types';
import { Model } from './types';

export interface ApiRequestLogRecord extends ApiRequestLog, BaseApiRequestLogRecord {}

export interface ApiRequestLogModel
  extends Model<BaseApiRequestLogModel, ApiRequestLog, ApiRequestLogRecord> {}
