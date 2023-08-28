/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { DatatrakWebSurveysRequest } from '@tupaia/types';
export type Survey = DatatrakWebSurveysRequest.ResBody[number];

export type SurveyParams = {
  projectCode: string;
  entityCode: string;
  surveyCode: string;
  screenNumber: string;
};
