import {
  SurveyScreenModel as BaseSurveyScreenModel,
  SurveyScreenRecord as BaseSurveyScreenRecord,
} from '@tupaia/database';
import { SurveyScreen } from '../models';
import { Model } from './types';

export interface SurveyScreenRecord extends SurveyScreen, BaseSurveyScreenRecord {}

export interface SurveyScreenModel
  extends Model<BaseSurveyScreenModel, SurveyScreen, SurveyScreenRecord> {}
