/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import {
  yup,
  yupUtils,
  ValidationError,
  constructRecordExistsWithId,
  constructIsEmptyOr,
  takesIdForm,
  takesDateForm,
} from '@tupaia/utils';
import { MeditrakAppServerModelRegistry } from '../../../types';
import { RawSurveyResponseObject } from './types';

export type ValidatedSurveyResponseObject = NonNullable<
  yup.InferType<ReturnType<typeof constructSurveyResponseValidator>>
>;

export const constructEntityValidator = (models: MeditrakAppServerModelRegistry) =>
  yup.object().shape({
    id: yup.string().test(yupUtils.yupTest(takesIdForm)).required(),
    code: yup.string().required(),
    parent_id: yup.string().test(yupUtils.yupTest(takesIdForm)).required(),
    name: yup.string().required(),
    type: yup.mixed<string>().oneOf(Object.values(models.entity.types)).required(),
    country_code: yup.string().required(),
  });

export const constructOptionsValidator = (models: MeditrakAppServerModelRegistry) =>
  yup.object().shape({
    id: yup.string().test(yupUtils.yupTest(takesIdForm)),
    value: yup.number().required(),
    option_set_id: yup
      .string()
      .test(yupUtils.yupTest(constructRecordExistsWithId(models.optionSet))),
    sort_order: yup.number(),
  });
const constructAnswerValidator = (models: MeditrakAppServerModelRegistry) =>
  yup.object().shape({
    id: yup.string().test(yupUtils.yupTest(takesIdForm)),
    type: yup.string().required(),
    question_id: yup.string().test(yupUtils.yupTest(constructRecordExistsWithId(models.question))),
    body: yup.string().required(),
  });

export const constructSurveyResponseValidator = (models: MeditrakAppServerModelRegistry) =>
  yup.object().shape({
    id: yup.string().test(yupUtils.yupTest(takesIdForm)),
    clinic_id: yup.string().test(yupUtils.yupTest(constructIsEmptyOr(takesIdForm))),
    entity_id: yup.string().test(yupUtils.yupTest(constructIsEmptyOr(takesIdForm))),
    start_time: yup.string().test(yupUtils.yupTest(takesDateForm)),
    end_time: yup.string().test(yupUtils.yupTest(takesDateForm)),
    data_time: yup.string().test(yupUtils.yupTest(constructIsEmptyOr(takesDateForm))),
    timestamp: yup.string().test(yupUtils.yupTest(takesDateForm)).required(),
    survey_id: yup.string().test(yupUtils.yupTest(takesIdForm)).required(),
    user_id: yup.string().test(yupUtils.yupTest(takesIdForm)),
    approval_status: yup.string(),
    answers: yup.array().of(constructAnswerValidator(models)).required(),
    entities_created: yup.array().of(constructEntityValidator(models)),
    options_created: yup.array().of(constructOptionsValidator(models)),
  });

export const validateSurveyResponseObject = async (
  models: MeditrakAppServerModelRegistry,
  surveyResponseObject: RawSurveyResponseObject,
) => {
  if (!surveyResponseObject) {
    throw new ValidationError('Payload must contain survey_response_object');
  }

  try {
    const surveyResponseObjectValidator = constructSurveyResponseValidator(models);
    const validatedSurveyResponseObject = await surveyResponseObjectValidator.validate(
      surveyResponseObject,
    );
    return validatedSurveyResponseObject;
  } catch (e: any) {
    throw new ValidationError(e.message);
  }
};
