/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import {
  ValidationError,
  constructRecordExistsWithId,
  constructIsEmptyOr,
  takesIdForm,
  takesDateForm,
  yup,
  yupUtils,
} from '@tupaia/utils';
import { MeditrakAppServerModelRegistry } from '../../../types';
import { SurveyResponseObject } from './types';

const clinicOrEntityIdExist = (surveyResponse: Record<string, unknown>) =>
  !(surveyResponse.clinic_id || surveyResponse.entity_id);

export const constructEntityValidator = (models: MeditrakAppServerModelRegistry) =>
  yup.object().shape({
    id: yup.string().test(yupUtils.yupTestSync(takesIdForm)).required(),
    code: yup.string().required(),
    parent_id: yup.string().test(yupUtils.yupTestSync(takesIdForm)).required(),
    name: yup.string().required(),
    type: yup.mixed<string>().oneOf(Object.values(models.entity.types)).required(),
    country_code: yup.string().required(),
  });

export const constructOptionsValidator = (models: MeditrakAppServerModelRegistry) =>
  yup.object().shape({
    id: yup.string().test(yupUtils.yupTestSync(takesIdForm)),
    value: yup.number().required(),
    option_set_id: yup
      .string()
      .test(yupUtils.yupTest(constructRecordExistsWithId(models.optionSet))),
    sort_order: yup.number(),
  });

export const constructSurveyResponseValidator = (models: MeditrakAppServerModelRegistry) =>
  yup
    .object()
    .shape({
      id: yup.string().test(yupUtils.yupTestSync(takesIdForm)),
      assessor_name: yup.string().required(),
      clinic_id: yup.string().test(yupUtils.yupTestSync(constructIsEmptyOr(takesIdForm))),
      data_time: yup.string().test(yupUtils.yupTestSync(constructIsEmptyOr(takesDateForm))),
      entity_id: yup.string().test(yupUtils.yupTestSync(constructIsEmptyOr(takesIdForm))),
      start_time: yup.string().test(yupUtils.yupTestSync(takesDateForm)),
      end_time: yup.string().test(yupUtils.yupTestSync(takesDateForm)),
      survey_id: yup.string().test(yupUtils.yupTestSync(takesIdForm)).required(),
      user_id: yup.string().test(yupUtils.yupTestSync(takesIdForm)),
      approval_status: yup.string(),
      answers: yup.array().of(constructAnswerValidator(models)).required(),
      entities_created: yup.array().of(constructEntityValidator(models)),
      options_created: yup.array().of(constructOptionsValidator(models)),
    })
    .test({ test: clinicOrEntityIdExist, message: 'Either clinic_id or entity_id are required.' });

const constructAnswerValidator = (models: MeditrakAppServerModelRegistry) =>
  yup.object().shape({
    id: yup.string().test(yupUtils.yupTestSync(takesIdForm)),
    type: yup.string().required(),
    question_id: yup.string().test(yupUtils.yupTest(constructRecordExistsWithId(models.question))),
    body: yup.string().required(),
  });

export type ValidatedEntitiesObject = yup.InferType<ReturnType<typeof constructEntityValidator>>;

export type ValidatedOptionsObject = yup.InferType<ReturnType<typeof constructOptionsValidator>>;

export type ValidatedSurveyResponseObject = NonNullable<
  yup.InferType<ReturnType<typeof constructSurveyResponseValidator>>
>;

export const validateSurveyResponseObject = async (
  models: MeditrakAppServerModelRegistry,
  surveyResponseObject: SurveyResponseObject,
) => {
  if (!surveyResponseObject) {
    throw new ValidationError('Payload must contain survey_response_object');
  }
  const surveyResponseObjectValidator = constructSurveyResponseValidator(models);
  const validatedSurveyResponseObject = await surveyResponseObjectValidator.validate(
    surveyResponseObject,
  );
  const answerObjectValidator = constructAnswerValidator(models);
  for (let i = 0; i < validatedSurveyResponseObject.answers.length; i++) {
    await answerObjectValidator.validate(validatedSurveyResponseObject.answers[i]);
  }

  return validatedSurveyResponseObject;
};
