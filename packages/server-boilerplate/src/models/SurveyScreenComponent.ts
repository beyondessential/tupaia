import {
  SurveyScreenComponentModel as BaseSurveyScreenComponentModel,
  SurveyScreenComponentRecord as BaseSurveyScreenComponentRecord,
} from '@tupaia/database';
import { SurveyScreenComponent } from '@tupaia/types';
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
