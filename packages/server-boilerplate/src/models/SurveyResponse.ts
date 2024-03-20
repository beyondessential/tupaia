/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import {
  SurveyResponseModel as BaseSurveyResponseModel,
  SurveyResponseRecord,
} from '@tupaia/database';
import { SurveyResponse } from '@tupaia/types';
import { Model } from './types';

export interface SurveyResponseModel
  extends Model<BaseSurveyResponseModel, Readonly<SurveyResponse>, SurveyResponseRecord> {
  approvalStatusTypes: {
    NOT_REQUIRED: string;
    PENDING: string;
    REJECTED: string;
    APPROVED: string;
  };
}
