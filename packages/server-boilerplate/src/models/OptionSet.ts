/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  OptionSetModel as BaseOptionSetModel,
  OptionSetRecord as BaseOptionSetRecord,
} from '@tupaia/database';
import { OptionSet } from '@tupaia/types';
import { Model } from './types';

export interface OptionSetRecord extends OptionSet, BaseOptionSetRecord {}

export interface OptionSetModel extends Model<BaseOptionSetModel, OptionSet, OptionSetRecord> {}
