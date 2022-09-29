/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import {
  SurveyResponseModel as BaseSurveyResponseModel,
  SurveyResponseType as BaseSurveyResponseType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';

export type SurveyResponseModelFields = Readonly<{
  id: string;
  survey_id: string;
  user_id: string;
  assessor_name: string;
  start_time: string;
  end_time: string;
  metadata: Record<string, any>;
  timezone: string | null;
  entity_id: string;
  data_time: string | null;
  outdated: boolean | null;
  approval_status: string;
}>;

export interface SurveyResponseModelType
  extends SurveyResponseModelFields,
    Omit<BaseSurveyResponseType, 'id'> {} // Omit base `id: any` type as we explicity define as a string here

export interface SurveyResponseModel
  extends Model<BaseSurveyResponseModel, SurveyResponseModelFields, SurveyResponseModelType> {
  approvalStatusTypes: {
    NOT_REQUIRED: string;
    PENDING: string;
    REJECTED: string;
    APPROVED: string;
  };
}
