import { getTimezoneNameFromTimestamp, stripTimezoneFromDate } from '@tupaia/utils';
import * as keyBy from 'lodash.keyby';

async function getRecordsByCode(model, codes) {
  const records = await model.find({ code: Array.from(codes) });
  return keyBy(records, 'code');
}

async function getEntitiesByCode(models, responses) {
  const entityCodes = new Set();
  responses.forEach(({ entity_code: entityCode }) => entityCode && entityCodes.add(entityCode));
  return getRecordsByCode(models.entity, entityCodes);
}

async function getQuestionsByCode(models, responses) {
  const questionCodes = new Set();
  responses.forEach(r => Object.keys(r.answers).forEach(code => questionCodes.add(code)));
  return getRecordsByCode(models.question, questionCodes);
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
  } = body;

  const timezoneName = getTimezoneNameFromTimestamp(timestamp);
  const time = new Date(timestamp).toISOString();

  return {
    id,
    entity_id: entityId || entitiesByCode[entityCode].id,
    survey_id: surveyId,
    data_time: dataTime || stripTimezoneFromDate(time),
    start_time: inputStartTime ? new Date(inputStartTime).toISOString() : time,
    end_time: inputEndTime ? new Date(inputEndTime).toISOString() : time,
    approval_status: approvalStatus,
    user_id: user.id,
    assessor_name: user.fullName,
    timezone: timezoneName,
  };
}

async function saveSurveyResponses(models, responseRecords) {
  const updatedResponseRecords = responseRecords.filter(({ id }) => !!id);
  const newResponseRecords = responseRecords.filter(({ id }) => !id);

  const updatedSurveyResponses = await Promise.all(
    updatedResponseRecords.map(async record => {
      return models.surveyResponse.updateOrCreate(
        {
          id: record.id,
        },
        record,
      );
    }),
  );

  const newSurveyResponses = await models.surveyResponse.createMany(newResponseRecords);

  return [...updatedSurveyResponses, ...newSurveyResponses];
}

export async function saveResponsesToDatabase(models, userId, responses) {
  // pre-fetch some data that will be used by multiple responses/answers
  const questionsByCode = await getQuestionsByCode(models, responses);
  const entitiesByCode = await getEntitiesByCode(models, responses);
  const user = await models.user.findById(userId);

  // build the response records then persist them to the database
  const responseRecords = responses.map(r => buildResponseRecord(user, entitiesByCode, r));
  const surveyResponses = await saveSurveyResponses(models, responseRecords);
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
