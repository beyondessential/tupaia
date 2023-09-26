/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import {
  SurveyResponseModel as BaseSurveyResponseModel,
  SurveyResponseType as BaseSurveyResponseType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { SurveyResponse } from '@tupaia/types';

export interface SurveyResponseModelType
  extends SurveyResponse,
    Omit<BaseSurveyResponseType, 'id'> {} // Omit base `id: any` type as we explicity define as a string here

export interface SurveyResponseModel
  extends Model<BaseSurveyResponseModel, SurveyResponse, SurveyResponseModelType> {
  approvalStatusTypes: {
    NOT_REQUIRED: string;
    PENDING: string;
    REJECTED: string;
    APPROVED: string;
  };
}
