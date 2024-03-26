/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { SurveyModel as BaseSurveyModel, SurveyRecord as BaseSurveyRecord } from '@tupaia/database';
import { Survey } from '@tupaia/types';
import { Model } from './types';

export interface SurveyRecord extends Survey, BaseSurveyRecord {}

export interface SurveyModel extends Model<BaseSurveyModel, Survey, SurveyRecord> {}
