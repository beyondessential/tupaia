/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { ControllerRenderProps } from 'react-hook-form';
import { DatatrakWebSurveyRequest } from '@tupaia/types';

export type Survey = DatatrakWebSurveyRequest.ResBody;
export type SurveyScreen = DatatrakWebSurveyRequest.ResBody['screens'][number];

export type SurveyScreenComponent = SurveyScreen['surveyScreenComponents'][number] & {
  updateFormDataOnChange?: boolean;
  questionNumber?: string;
};

export type SurveyParams = {
  projectCode: string;
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

export type SurveyQuestionInputProps = SurveyQuestionFieldProps & {
  controllerProps: ControllerRenderProps & {
    invalid?: boolean;
  };
  required?: boolean;
  min?: number;
  max?: number;
};
