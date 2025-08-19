import {
  SurveyScreenComponentModel as BaseSurveyScreenComponentModel,
  SurveyScreenComponentRecord as BaseSurveyScreenComponentRecord,
} from '@tupaia/database';
import { SurveyScreenComponent } from '../models';
import { Model } from './types';

export interface SurveyScreenComponentRecord
  extends SurveyScreenComponent,
    BaseSurveyScreenComponentRecord {}

export interface SurveyScreenComponentModel
  extends Model<
    BaseSurveyScreenComponentModel,
    SurveyScreenComponent,
    SurveyScreenComponentRecord
  > {}
