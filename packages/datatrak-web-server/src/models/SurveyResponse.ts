/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  SurveyResponseModel as BaseSurveyResponseModel,
  SurveyResponseRecord as BaseSurveyResponseRecord,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';

import { SurveyResponse } from '@tupaia/types';

export interface SurveyResponseModelType
  extends SurveyResponse,
    Omit<BaseSurveyResponseRecord, 'id'> {} // Omit base `id: any` type as we explicity define as a string here

export interface SurveyResponseModel
  extends Model<BaseSurveyResponseModel, SurveyResponse, SurveyResponseModelType> {}
