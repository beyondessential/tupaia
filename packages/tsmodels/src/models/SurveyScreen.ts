import {
  SurveyScreenModel as BaseSurveyScreenModel,
  SurveyScreenRecord as BaseSurveyScreenRecord,
} from '@tupaia/database';
import { SurveyScreen } from '@tupaia/types';
import { Model } from './types';

export interface SurveyScreenRecord extends SurveyScreen, BaseSurveyScreenRecord {}

export interface SurveyScreenModel
  extends Model<BaseSurveyScreenModel, SurveyScreen, SurveyScreenRecord> {}
