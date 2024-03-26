/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  SurveyGroupModel as BaseSurveyGroupModel,
  SurveyGroupRecord as BaseSurveyGroupRecord,
} from '@tupaia/database';
import { SurveyGroup } from '@tupaia/types';
import { Model } from './types';

export interface SurveyGroupRecord extends SurveyGroup, BaseSurveyGroupRecord {}

export interface SurveyGroupModel
  extends Model<BaseSurveyGroupModel, SurveyGroup, SurveyGroupRecord> {}
