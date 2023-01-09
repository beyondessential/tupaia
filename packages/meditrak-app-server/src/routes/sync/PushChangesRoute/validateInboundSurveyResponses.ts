/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import {
  hasContent,
  constructIsValidEntityType,
  isNumber,
  isArray,
  constructEveryItem,
  ObjectValidator,
  ValidationError,
  constructRecordExistsWithId,
  constructIsEmptyOr,
  takesIdForm,
  takesDateForm,
} from '@tupaia/utils';
import { MeditrakAppServerModelRegistry } from '../../../types';
import { SurveyResponseObject, ValidatedSurveyResponseObject } from './types';

const clinicOrEntityIdExist = (id: string, obj: { clinic_id?: string; entity_id?: string }) => {
  if (!(obj.clinic_id || obj.entity_id)) {
    throw new Error('Either clinic_id or entity_id are required.');
  }
};

const constructAnswerValidators = (models: MeditrakAppServerModelRegistry) => ({
  id: [hasContent, takesIdForm],
  type: [hasContent],
  question_id: [hasContent, takesIdForm, constructRecordExistsWithId(models.question)],
  body: [hasContent],
});

const constructEntityValidator = (models: MeditrakAppServerModelRegistry) => ({
  id: [hasContent, takesIdForm],
  code: [hasContent],
  parent_id: [takesIdForm],
  name: [hasContent],
  type: [constructIsValidEntityType(models.entity)],
  country_code: [hasContent],
});

const constructIsValidEntity = (models: MeditrakAppServerModelRegistry) => async (
  value: Record<string, any>,
) => new ObjectValidator(constructEntityValidator(models)).validate(value);

const constructOptionsCreatedValidators = (models: MeditrakAppServerModelRegistry) => ({
  id: [hasContent, takesIdForm],
  value: [hasContent],
  option_set_id: [hasContent, takesIdForm, constructRecordExistsWithId(models.optionSet)],
  sort_order: [isNumber],
});

const constructIsValidOption = (models: MeditrakAppServerModelRegistry) => async (
  value: Record<string, any>,
) => new ObjectValidator(constructOptionsCreatedValidators(models)).validate(value);

export const constructSurveyResponseValidator = (models: MeditrakAppServerModelRegistry) => ({
  id: [hasContent, takesIdForm],
  clinic_id: [clinicOrEntityIdExist, constructIsEmptyOr(takesIdForm)],
  entity_id: [clinicOrEntityIdExist, constructIsEmptyOr(takesIdForm)],
  start_time: [constructIsEmptyOr(takesDateForm)],
  end_time: [constructIsEmptyOr(takesDateForm)],
  data_time: [constructIsEmptyOr(takesDateForm)],
  timestamp: [hasContent, takesDateForm],
  survey_id: [hasContent, takesIdForm],
  user_id: [hasContent, takesIdForm],
  answers: [hasContent, isArray],
  entities_created: [constructIsEmptyOr(constructEveryItem(constructIsValidEntity(models)))],
  options_created: [constructIsEmptyOr(constructEveryItem(constructIsValidOption(models)))],
});

export const validateSurveyResponseObject = async (
  models: MeditrakAppServerModelRegistry,
  surveyResponseObject: SurveyResponseObject,
) => {
  if (!surveyResponseObject) {
    throw new ValidationError('Payload must contain survey_response_object');
  }

  const surveyResponseObjectValidator = new ObjectValidator(
    constructSurveyResponseValidator(models),
  );
  const answerObjectValidator = new ObjectValidator(constructAnswerValidators(models));
  await surveyResponseObjectValidator.validate(surveyResponseObject);

  const validatedSurveyResponseObject = surveyResponseObject as ValidatedSurveyResponseObject;

  for (let i = 0; i < validatedSurveyResponseObject.answers.length; i++) {
    await answerObjectValidator.validate(validatedSurveyResponseObject.answers[i]);
  }

  return validatedSurveyResponseObject;
};
