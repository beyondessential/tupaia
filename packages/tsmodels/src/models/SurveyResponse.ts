import {
  SurveyResponseModel as BaseSurveyResponseModel,
  SurveyResponseRecord as BaseSurveyResponseRecord,
} from '@tupaia/database';
import { SurveyResponse } from '@tupaia/types';
import { Model } from './types';

export interface SurveyResponseRecord extends SurveyResponse, BaseSurveyResponseRecord {}

export interface SurveyResponseModel
  extends Model<BaseSurveyResponseModel, SurveyResponse, SurveyResponseRecord> {
  approvalStatusTypes: {
    NOT_REQUIRED: string;
    PENDING: string;
    REJECTED: string;
    APPROVED: string;
  };
}
