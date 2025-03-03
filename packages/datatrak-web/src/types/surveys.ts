import { ControllerRenderProps } from 'react-hook-form';
import { DatatrakWebSurveyRequest } from '@tupaia/types';

export type Survey = DatatrakWebSurveyRequest.ResBody;
export type SurveyScreen = Survey['screens'][number];

export type SurveyScreenComponent = SurveyScreen['surveyScreenComponents'][0] & {
  updateFormDataOnChange?: boolean;
};

export type SurveyParams = {
  projectCode: string;
  countryCode: string;
  entityCode: string;
  surveyCode: string;
  screenNumber: string;
};

export type SurveyQuestionFieldProps = Omit<
  SurveyScreenComponent,
  'componentNumber' | 'questionId'
> & {
  name: SurveyScreenComponent['code'];
  id: SurveyScreenComponent['questionId'];
};

export type SurveyQuestionInputProps = Omit<SurveyQuestionFieldProps, 'type' | 'text'> & {
  controllerProps: ControllerRenderProps & {
    invalid?: boolean;
  };
  required?: boolean;
  min?: number;
  max?: number;
  type?: SurveyQuestionFieldProps['type'];
  text?: SurveyQuestionFieldProps['text'];
};
