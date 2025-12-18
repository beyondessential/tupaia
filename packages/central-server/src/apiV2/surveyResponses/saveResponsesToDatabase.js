import { keyBy } from 'es-toolkit/compat';
import momentTimezone from 'moment-timezone';

import { generateId } from '@tupaia/database';
import { getTimezoneNameFromTimestamp } from '@tupaia/tsutils';
import { ValidationError, stripTimezoneFromDate } from '@tupaia/utils';

import { upsertAnswers } from '../../dataAccessors';

async function getRecordsByCode(model, codes) {
  const records = await model.find({ code: Array.from(codes) });
  return keyBy(records, 'code');
}

async function getEntitiesByCode(models, responses) {
  const entityCodes = new Set();
  responses.forEach(({ entity_code: entityCode }) => entityCode && entityCodes.add(entityCode));
  return getRecordsByCode(models.entity, entityCodes);
}

async function getQuestionsByCode(models, answers) {
  const questionCodes = new Set();
  Object.keys(answers).forEach(code => questionCodes.add(code));
  return getRecordsByCode(models.question, questionCodes);
}

/** Convert answers from { [questionCode]: [answerValue], [questionCode]: [answerValue] }
 * to [ { type, question_id, body} ]
 */
async function buildAnswerRecords(models, rawAnswerRecords) {
  if (Array.isArray(rawAnswerRecords)) {
    return rawAnswerRecords;
  }

  const questionsByCode = await getQuestionsByCode(models, rawAnswerRecords);
  const answerRecords = Object.entries(rawAnswerRecords).map(([code, value]) => {
    const question = questionsByCode[code];
    return {
      type: question.type,
      question_id: question.id,
      body: value,
    };
  });

  return answerRecords;
}

async function saveAnswerRecords(models, rawAnswerRecords, surveyResponseId) {
  const answerRecords = await buildAnswerRecords(models, rawAnswerRecords);
  return upsertAnswers(models, answerRecords, surveyResponseId);
}

function buildResponseRecord(user, entitiesByCode, body) {
  // assumes validateResponse has succeeded
  const {
    id,
    entity_id: entityId,
    entity_code: entityCode,
    survey_id: surveyId,
    start_time: inputStartTime,
    end_time: inputEndTime,
    data_time: inputDataTime,
    approval_status: approvalStatus,
    timestamp,
    timezone,
  } = body;

  /**
   * We use timestamp as a fallback for all the time related fields (start_time, end_time, data_time, timezone)
   * If all of those fields are present, we don't need a value for timestamp
   * But if any of them are missing, and we don't have a value for timestamp, we throw an error
   */
  if (!timezone && !timestamp) {
    throw new ValidationError('Must provide timezone or timestamp');
  }

  const defaultToTimestampOrThrow = (value, parameterName) => {
    if (value)
      return momentTimezone(value)
        .tz(timezone || 'Etc/UTC')
        .format();
    if (timestamp)
      return momentTimezone(timestamp)
        .tz(timezone || 'Etc/UTC')
        .format();

    throw new ValidationError(`Must provide ${parameterName} or timestamp`);
  };

  const startTime = defaultToTimestampOrThrow(inputStartTime, 'start_time');
  const endTime = defaultToTimestampOrThrow(inputEndTime, 'end_time');
  const dataTime = stripTimezoneFromDate(defaultToTimestampOrThrow(inputDataTime, 'data_time'));

  return {
    id: id || generateId(),
    survey_id: surveyId,
    user_id: user.id,
    entity_id: entityId || entitiesByCode[entityCode].id,
    data_time: dataTime,
    start_time: startTime,
    end_time: endTime,
    timezone: timezone || getTimezoneNameFromTimestamp(timestamp),
    assessor_name: user.fullName,
    approval_status: approvalStatus,
  };
}

async function saveSurveyResponses(models, responseRecords) {
  return Promise.all(
    responseRecords.map(async record => {
      return models.surveyResponse.updateOrCreate(
        {
          id: record.id,
        },
        record,
      );
    }),
  );
}

export async function saveResponsesToDatabase(models, userId, responses) {
  // pre-fetch some data that will be used by multiple responses/answers
  const [entitiesByCode, user] = await Promise.all([
    getEntitiesByCode(models, responses),
    models.user.findById(userId),
  ]);

  // build the response records then persist them to the database
  const responseRecords = responses.map(r => buildResponseRecord(user, entitiesByCode, r));
  let idsCreated;

  try {
    const surveyResponses = await saveSurveyResponses(models, responseRecords);
    idsCreated = surveyResponses.map(r => ({ surveyResponseId: r.id }));

    // build the answer records then persist them to the database
    // note that we could build all of the answers for all responses at once, and persist them in one
    // big batch, but that approach resulted in occasional id clashes for POSTs of around 10k answers,
    // (unexpectedly, doing them in series and smaller batches is also 5x faster on a macbook pro,
    // though this is probably very dependent on the hardware - parallel should be faster if it didn't
    // overwhelm postgres)
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const answers = await saveAnswerRecords(models, response.answers, surveyResponses[i].id);

      idsCreated[i].answerIds = answers.map(a => a.id);
    }
  } catch (e) {
    throw new Error(`Failed to save survey responses, error: ${e.message}`);
  }

  return idsCreated;
}
