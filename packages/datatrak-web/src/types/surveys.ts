/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { Ref } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { DatatrakWebSurveysRequest, DatatrakWebSurveyScreenComponentsRequest } from '@tupaia/types';

export type Survey = DatatrakWebSurveysRequest.ResBody[number];

export type SurveyScreenComponent = DatatrakWebSurveyScreenComponentsRequest.ResBody[number] & {
  questionNumber?: string;
};

export type SurveyParams = {
  projectCode: string;
  entityCode: string;
  surveyCode: string;
  screenNumber: string;
};

export type SurveyQuestionFieldProps = {
  id: string;
  name: SurveyScreenComponent['questionCode'];
  label?: string;
  code?: SurveyScreenComponent['questionCode'];
  text?: string;
  config?: any;
  type?: string;
  detailLabel?: string | null;
  options?: SurveyScreenComponent['questionOptions'];
  optionSetId?: SurveyScreenComponent['questionOptionSetId'];
  updateOnBlur?: boolean;
};

export type SurveyQuestionInputProps = SurveyQuestionFieldProps & {
  inputRef: Ref<HTMLInputElement>;
  controllerProps: ControllerRenderProps;
};
