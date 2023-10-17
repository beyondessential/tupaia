/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import {
  SurveyResponseModel as BaseSurveyResponseModel,
  SurveyResponseType as BaseSurveyResponseType,
} from '@tupaia/database';
import { SurveyResponse } from '@tupaia/types';
import { Model } from './types';

export interface SurveyResponseType extends SurveyResponse, BaseSurveyResponseType {}

export interface SurveyResponseModel
  extends Model<BaseSurveyResponseModel, SurveyResponse, SurveyResponseType> {
  approvalStatusTypes: {
    NOT_REQUIRED: string;
    PENDING: string;
    REJECTED: string;
    APPROVED: string;
  };
}
