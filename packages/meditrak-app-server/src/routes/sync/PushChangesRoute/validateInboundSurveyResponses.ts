/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { MeditrakSurveyResponseRequestSchema } from '@tupaia/types';
import type { MeditrakSurveyResponseRequest } from '@tupaia/types';
import { getAjv } from '@tupaia/tsutils';
import { ValidationError } from '@tupaia/utils';
import { MeditrakAppServerModelRegistry } from '../../../types';
import { RawSurveyResponseObject } from './types';

export const validateSurveyResponseObject = async (
  models: MeditrakAppServerModelRegistry,
  surveyResponseObject: RawSurveyResponseObject,
) => {
  if (!surveyResponseObject) {
    throw new ValidationError('Payload must contain survey_response_object');
  }

  try {
    const ajv = getAjv(models);
    const surveyResponseValidate = ajv.compile(MeditrakSurveyResponseRequestSchema);
    const validatedSurveyResponseObject = (await surveyResponseValidate(
      surveyResponseObject,
    )) as MeditrakSurveyResponseRequest;

    return validatedSurveyResponseObject;
  } catch (e: any) {
    throw new ValidationError(`Survey response validation error: ${e.errors}`);
  }
};
