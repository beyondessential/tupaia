import {
  SurveyGroupModel as BaseSurveyGroupModel,
  SurveyGroupRecord as BaseSurveyGroupRecord,
} from '@tupaia/database';
import { SurveyGroup } from '@tupaia/types';
import { Model } from './types';

export interface SurveyGroupRecord extends SurveyGroup, BaseSurveyGroupRecord {}

export interface SurveyGroupModel
  extends Model<BaseSurveyGroupModel, SurveyGroup, SurveyGroupRecord> {}
