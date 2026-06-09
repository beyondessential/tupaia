import type {
  SurveyResponseDraftRecord as BaseSurveyResponseDraftRecord,
  SurveyResponseDraftModel as BaseSurveyResponseDraftModel,
} from '@tupaia/database';
import type { SurveyResponseDraft } from '@tupaia/types';
import type { Model } from './types';

export interface SurveyResponseDraftRecord extends SurveyResponseDraft, BaseSurveyResponseDraftRecord {}

export interface SurveyResponseDraftModel
  extends Model<BaseSurveyResponseDraftModel, SurveyResponseDraft, SurveyResponseDraftRecord> {}
