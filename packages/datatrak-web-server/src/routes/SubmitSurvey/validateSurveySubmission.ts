/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ValidationError } from '@tupaia/utils';
import { ajvValidate } from '@tupaia/tsutils';
import {
  DatatrakWebSubmitSurveyRequest,
  DatatrakWebSurveyResponseRequestSchema,
} from '@tupaia/types';

type SubmittedSurveyResponseType = DatatrakWebSubmitSurveyRequest.ReqBody;

export const validateSurveySubmission = (surveySubmission: SubmittedSurveyResponseType) => {
  if (!surveySubmission) {
    throw new ValidationError('A survey submission must contain data');
  }

  return ajvValidate<SubmittedSurveyResponseType>(
    DatatrakWebSurveyResponseRequestSchema,
    surveySubmission,
  );
};
