/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { Ref } from 'react';
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
  name: string;
  label?: string;
  code?: string;
  text?: string;
  config?: any;
  type?: string;
  detailLabel?: string;
  options?: (
    | string
    | {
        value: string;
        label: string;
      }
  )[];
};

export type SurveyQuestionInputProps = SurveyQuestionFieldProps & {
  inputRef: Ref<HTMLInputElement>;
};
