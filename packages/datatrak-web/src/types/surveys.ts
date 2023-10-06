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
};

export type SurveyParams = {
  projectCode: string;
  entityCode: string;
  surveyCode: string;
  screenNumber: string;
};

export type SurveyQuestionFieldProps = SurveyScreenComponent & {
  name: SurveyScreenComponent['code'];
  label?: string;
};

export type SurveyQuestionInputProps = SurveyQuestionFieldProps & {
  controllerProps: ControllerRenderProps;
};
