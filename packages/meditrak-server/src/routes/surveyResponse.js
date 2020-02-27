/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { keyBy } from 'lodash';
import { getTimezoneNameFromTimestamp, ValidationError, MultiValidationError } from '@tupaia/utils';
import {
  ObjectValidator,
  hasContent,
  constructRecordExistsWithId,
  constructRecordExistsWithCode,
  constructAnswerValidator,
  constructIsEmptyOr,
} from '../validation';
import { findQuestionsBySurvey } from '../dataAccessors';

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

function buildResponseRecord(user, entitiesByCode, body) {
  // assumes validateResponse has succeeded
  const { entity_id: entityId, entity_code: entityCode, timestamp, survey_id: surveyId } = body;

  const timezoneName = getTimezoneNameFromTimestamp(timestamp);
  const time = new Date(timestamp).toISOString();

  return {
    survey_id: surveyId,
    user_id: user.id,
    entity_id: entityId || entitiesByCode[entityCode].id,
    submission_time: time,
    start_time: time,
    end_time: time,
    timezone: timezoneName,
    assessor_name: user.fullName,
  };
}

async function getRecordsByCode(model, codes) {
  const records = await model.find({ code: Array.from(codes) });
  return keyBy(records, 'code');
}

function buildAnswerRecords(answers, surveyResponseId, questionsByCode) {
  return Object.entries(answers).map(([code, value]) => {
    const question = questionsByCode[code];
    return {
      type: question.type,
      survey_response_id: surveyResponseId,
      question_id: question.id,
      text: value,
    };
  });
}

async function getQuestionsByCode(models, responses) {
  const questionCodes = new Set();
  responses.forEach(r => Object.keys(r.answers).forEach(code => questionCodes.add(code)));
  return getRecordsByCode(models.question, questionCodes);
}

async function getEntitiesByCode(models, responses) {
  const entityCodes = new Set();
  responses.forEach(({ entity_code: entityCode }) => entityCode && entityCodes.add(entityCode));
  return getRecordsByCode(models.entity, entityCodes);
}

async function saveResponsesToDatabase(models, userId, responses) {
  // pre-fetch some data that will be used by multiple responses/answers
  const questionsByCode = await getQuestionsByCode(models, responses);
  const entitiesByCode = await getEntitiesByCode(models, responses);
  const user = await models.user.findById(userId);

  // build the response records then persist them to the database
  const responseRecords = responses.map(r => buildResponseRecord(user, entitiesByCode, r));
  const surveyResponses = await models.surveyResponse.createMany(responseRecords);
  const idsCreated = surveyResponses.map(r => ({ surveyResponseId: r.id }));

  // build the answer records then persist them to the database
  // note that we could build all of the answers for all responses at once, and persist them in one
  // big batch, but that approach resulted in occasional id clashes for POSTs of around 10k answers,
  // (unexpectedly, doing them in series and smaller batches is also 5x faster on a macbook pro,
  // though this is probably very dependent on the hardware - parallel should be faster if it didn't
  // overwhelm postgres)
  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    const answerRecords = buildAnswerRecords(
      response.answers,
      surveyResponses[i].id,
      questionsByCode,
    );
    const answers = await models.answer.createMany(answerRecords);
    idsCreated[i].answerIds = answers.map(a => a.id);
  }

  return idsCreated;
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

  return saveResponsesToDatabase(models, userId, responses);
};

export async function surveyResponse(req, res) {
  const { userId, body, models } = req;

  let results;
  const responses = Array.isArray(body) ? body : [body];
  await models.wrapInTransaction(async transactingModels => {
    results = await submitResponses(transactingModels, userId, responses);
  });
  res.send({ count: responses.length, results });
}
