/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import {
  Question,
  Survey,
  SurveyScreen as BaseSurveyScreen,
  SurveyScreenComponent as BaseSurveyScreenComponent,
} from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export type Params = Record<string, never>;

type VisibilityCriteria = Record<Question['id'], any> & {
  _conjunction?: string;
};

type ValidationCriteria = {
  required?: boolean;
  min?: number;
  max?: number;
};

type SurveyScreenComponent = BaseSurveyScreenComponent &
  KeysToCamelCase<Question> & {
    visibilityCriteria?: VisibilityCriteria;
    validationCriteria?: ValidationCriteria;
    config?: Record<string, unknown> | null;
    componentId?: BaseSurveyScreenComponent['id'];
  };
type SurveyScreen = Pick<BaseSurveyScreen, 'id' | 'screen_number'> & {
  surveyScreenComponents: SurveyScreenComponent[];
};

type SurveyResponse = KeysToCamelCase<Survey> & {
  surveyGroupName?: string | null;
  screens: SurveyScreen[];
  countryNames?: string[];
};

export type ResBody = SurveyResponse;
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  fields?: string[];
}
