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

// Separating these out because sometimes the camel casing of Record<string, unknown> is not then identitied as still being a Record<string, unknown>

type CamelCasedQuestion = KeysToCamelCase<Omit<Question, 'options'>>;

type CamelCasedComponent = KeysToCamelCase<
  Omit<
    BaseSurveyScreenComponent,
    'validation_criteria' | 'visibility_criteria' | 'config' | 'id' | 'question_label' | 'screen_id'
  >
>;

export type CodeGeneratorConfig = {
  type: 'shortid' | 'mongoid';
  prefix?: string;
  length?: number;
  chunkLength?: number;
  alphabet?: string;
};

export type AutocompleteConfig = {
  createNew?: boolean;
  attributes?: {
    [key: string]: { questionId: Question['id'] };
  };
};

export type ConditionConfig = {
  conditions: {
    [key: string]: {
      formula: string;
      defaultValues?: Record<Question['id'], any>;
    };
  };
};

type Config = {
  codeGenerator?: CodeGeneratorConfig;
  autocomplete?: AutocompleteConfig;
  condition?: ConditionConfig;
};

type SurveyScreenComponent = CamelCasedComponent &
  CamelCasedQuestion & {
    visibilityCriteria?: VisibilityCriteria;
    validationCriteria?: ValidationCriteria;
    config?: Config | null;
    componentId?: BaseSurveyScreenComponent['id'];
    label?: BaseSurveyScreenComponent['question_label'];
    options?: Record<string, unknown>[] | null;
  };

type CamelCasedSurveyScreen = KeysToCamelCase<Pick<BaseSurveyScreen, 'id' | 'screen_number'>>;

type SurveyScreen = CamelCasedSurveyScreen & {
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
