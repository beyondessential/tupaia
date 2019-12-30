/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { ValidationError, MultiValidationError } from '../errors';
import {
  ObjectValidator,
  hasContent,
  constructRecordExistsWithId,
  constructRecordExistsWithCode,
  constructAnswerValidator,
  constructIsEmptyOr,
} from '../validation';
import { findQuestionsBySurvey } from '../dataAccessors';
import { getTimezoneNameFromTimestamp } from '../utilities';

const createSurveyResponseValidator = models =>
  new ObjectValidator({
    entity_id: [constructIsEmptyOr(constructRecordExistsWithId(models.entity))],
    entity_code: [constructIsEmptyOr(constructRecordExistsWithCode(models.entity))],
    timestamp: [hasContent],
    survey_id: [hasContent, constructRecordExistsWithId(models.survey)],
    answers: [hasContent],
  });

async function validateResponse(models, userId, body) {
  if (!body) {
    throw new ValidationError('Survey responses must not be null');
  }

  const surveyResponseValidator = createSurveyResponseValidator(models);
  await surveyResponseValidator.validate(body);

  if (!body.entity_id && !body.entity_code) {
    throw new Error('Must provide one of entity_id or entity_code');
  }

  const surveyQuestions = await findQuestionsBySurvey(models, { survey_id: body.survey_id });

  const { answers } = body;
  if (Object.keys(answers).length === 0) {
    throw new ValidationError('Each survey response must contain at least one answer');
  }

  const answerValidations = Object.entries(answers).map(async ([questionCode, value]) => {
    if (value === null || value === undefined) {
      throw new ValidationError(`Answer for ${questionCode} is missing value`);
    }

    const question = surveyQuestions.find(q => q.code === questionCode);
    if (!question) {
      throw new ValidationError(
        `Could not find question with code ${questionCode} on survey ${body.survey_id}`,
      );
    }

    try {
      const answerValidator = new ObjectValidator({}, constructAnswerValidator(models, question));
      await answerValidator.validate({ answer: value });
    } catch (e) {
      // validator will always complain of field "answer" but in this context it is not
      // particularly useful
      throw new Error(e.message.replace('field "answer"', `question code "${questionCode}"`));
    }
  });

  await Promise.all(answerValidations);
}

async function submitResponse(models, userId, body) {
  // assumes validateResponse has succeeded

  const { entity_id, entity_code, timestamp, survey_id, answers } = body;

  const entityId = entity_id || (await models.entity.findOne({ code: entity_code })).id;

  const timezoneName = getTimezoneNameFromTimestamp(timestamp);
  const time = new Date(timestamp).toISOString();

  const user = await models.user.findOne({ id: userId });

  // create new survey response
  const surveyResponseModel = await models.surveyResponse.create({
    survey_id,
    user_id: userId,
    entity_id: entityId,
    submission_time: time,
    start_time: time,
    end_time: time,
    timezone: timezoneName,
    assessor_name: user.fullName,
  });

  const answerTasks = Object.entries(answers).map(async ([questionCode, value]) => {
    const question = await models.question.findOne({ code: questionCode });

    const answer = {
      type: question.type,
      survey_response_id: surveyResponseModel.id,
      question_id: question.id,
      text: value,
    };
    return models.answer.create(answer);
  });

  const answerResults = await Promise.all(answerTasks);
  const answerIds = answerResults.map(a => a.id);

  return {
    surveyResponseId: surveyResponseModel.id,
    answerIds,
  };
}

export async function surveyResponse(req, res) {
  const { userId, body, models } = req;

  const responses = Array.isArray(body) ? body : [body];
  await models.wrapInTransaction(async transactingModels => {
    const results = await submitResponses(transactingModels, userId, responses);
    res.send({ count: responses.length, results });
  });
}

export const submitResponses = async (models, userId, responses) => {
  // allow responses to be submitted in bulk
  const validations = await Promise.all(
    responses.map(async (r, i) => {
      try {
        await validateResponse(models, userId, r);
        return null;
      } catch (e) {
        return { row: i, error: e.message };
      }
    }),
  );

  const errors = validations.filter(x => x);
  if (errors.length > 0) {
    throw new MultiValidationError(
      'The request contained invalid responses. No records have been created; please fix the issues and send the whole request again.',
      errors,
    );
  }

  return Promise.all(responses.map(r => submitResponse(models, userId, r)));
};
