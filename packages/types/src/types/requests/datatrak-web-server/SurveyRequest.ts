import {
  Question,
  Survey,
  SurveyScreen as BaseSurveyScreen,
  SurveyScreenComponent as BaseSurveyScreenComponent,
  Option as BaseOption,
} from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';
import { SurveyScreenComponentConfig } from '../../models-extra';
import { WebServerProjectRequest } from '../web-server';

export type Params = Record<string, never>;

type VisibilityCriteria = Record<Question['id'], any> & {
  _conjunction?: string;
};

type ValidationCriteria = {
  mandatory?: boolean;
  min?: number;
  max?: number;
};

// Separating these out because sometimes the camel casing of Record<string, unknown> is not then identitied as still being a Record<string, unknown>

type CamelCasedQuestion = KeysToCamelCase<Omit<Question, 'options' | 'id'>>;

type CamelCasedComponent = KeysToCamelCase<
  Omit<
    BaseSurveyScreenComponent,
    | 'validation_criteria'
    | 'visibility_criteria'
    | 'config'
    | 'id'
    | 'question_label'
    | 'screen_id'
    | 'type'
  >
>;

export type Option = Pick<BaseOption, 'value' | 'label'> & {
  color?: string;
};

export type SurveyScreenComponent = CamelCasedComponent &
  CamelCasedQuestion & {
    visibilityCriteria?: VisibilityCriteria;
    validationCriteria?: ValidationCriteria;
    config?: SurveyScreenComponentConfig | null;
    componentId?: BaseSurveyScreenComponent['id'];
    label?: BaseSurveyScreenComponent['question_label'];
    options?: Option[] | null;
    screenId?: string;
    id?: string;
  };

type CamelCasedSurveyScreen = KeysToCamelCase<Pick<BaseSurveyScreen, 'id' | 'screen_number'>>;

type SurveyScreen = CamelCasedSurveyScreen & {
  surveyScreenComponents: SurveyScreenComponent[];
};

type SurveyResponse = KeysToCamelCase<Survey> & {
  surveyGroupName?: string | null;
  screens: SurveyScreen[];
  countryNames?: string[];
  isPublic: boolean;
  project?: WebServerProjectRequest.ProjectResponse | null;
};

export type ResBody = SurveyResponse;
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  fields?: string[];
  projectId?: string;
  countryCode?: string;
  searchTerm?: string;
}
