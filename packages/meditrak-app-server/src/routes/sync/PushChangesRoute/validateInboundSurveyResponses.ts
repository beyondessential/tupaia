import { MeditrakSurveyResponseRequestSchema, MeditrakSurveyResponseRequest } from '@tupaia/types';
import { ajvValidate } from '@tupaia/tsutils';
import { ValidationError } from '@tupaia/utils';
import { RawSurveyResponseObject } from './types';

export const validateSurveyResponseObject = (surveyResponseObject: RawSurveyResponseObject) => {
  if (!surveyResponseObject) {
    throw new ValidationError('Payload must contain survey_response_object');
  }

  try {
    return ajvValidate<MeditrakSurveyResponseRequest>(
      MeditrakSurveyResponseRequestSchema,
      surveyResponseObject,
    );
  } catch (err: any) {
    throw new ValidationError(`Survey response validation error: ${err.message}`);
  }
};
