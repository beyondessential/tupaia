import { generateId } from '@tupaia/database';
import { getTimezoneNameFromTimestamp } from '@tupaia/tsutils';
import { stripTimezoneFromDate } from '@tupaia/utils';
import keyBy from 'lodash.keyby';
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
  const answers = await upsertAnswers(models, answerRecords, surveyResponseId);

  return answers;
}

function buildResponseRecord(user, entitiesByCode, body) {
  // assumes validateResponse has succeeded
  const {
    id,
    entity_id: entityId,
    entity_code: entityCode,
    timestamp,
    survey_id: surveyId,
    data_time: dataTime,
    start_time: inputStartTime,
    end_time: inputEndTime,
    approval_status: approvalStatus,
    timezone,
  } = body;
  let { timezone, data_time: dataTime } = body;
  let startTime;
  let endTime;

  startTime = inputStartTime ? new Date(inputStartTime).toISOString() : new Date().toISOString();
  endTime = inputEndTime ? new Date(inputEndTime).toISOString() : new Date().toISOString();

  if (timestamp) {
    const time = new Date(timestamp).toISOString();
    startTime = time;
    endTime = time;
    dataTime = stripTimezoneFromDate(time);
    timezone = getTimezoneNameFromTimestamp(timestamp);
  }

  return {
    id: id || generateId(),
    survey_id: surveyId,
    user_id: user.id,
    entity_id: entityId || entitiesByCode[entityCode].id,
    data_time: dataTime,
    start_time: startTime,
    end_time: endTime,
    timezone,
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
  const entitiesByCode = await getEntitiesByCode(models, responses);
  const user = await models.user.findById(userId);

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
