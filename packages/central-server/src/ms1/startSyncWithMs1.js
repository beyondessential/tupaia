import { get } from 'es-toolkit/compat';

import { HttpError } from '@tupaia/utils';

import { findQuestionsInSurvey } from '../dataAccessors/findQuestionsInSurvey';
import { ExternalApiSyncQueue } from '../externalApiSync';
import winston from '../log';
import { Ms1ChangeDetailGenerator } from './Ms1ChangeDetailGenerator';
import { Ms1ChangeValidator } from './Ms1ChangeValidator';
import { addToSyncLog } from './addToSyncLog';
import { Ms1Api } from './api/Ms1Api';
import { generateMs1VariableName } from './utilities/generateMs1VariableName';

const PERIOD_BETWEEN_SYNCS = 1 * 60 * 1000; // 1 minute between syncs
const MAX_BATCH_SIZE = 10;
const INVALID_HTTP_CODES = [400, 500];
const ENDPOINT_NOT_FOUND = 'Endpoint not found to send data to MS1';

export async function startSyncWithMs1(models) {
  if (process.env.MS1_SYNC_DISABLE === 'true') {
    winston.info('MS1 sync is disabled');
    return;
  }

  const subscriptions = [models.surveyResponse.databaseRecord];
  const validator = new Ms1ChangeValidator(models);
  const detailGenerator = new Ms1ChangeDetailGenerator(models);

  // Syncs  changes to MS1 aggregation servers
  const syncQueue = new ExternalApiSyncQueue(
    models,
    validator,
    subscriptions,
    detailGenerator,
    models.ms1SyncQueue,
  );

  // Get appropriate aggregation server api, or create it if this is the first use
  const ms1Api = new Ms1Api();
  syncWithMs1(models, syncQueue, ms1Api);
  setInterval(() => syncWithMs1(models, syncQueue, ms1Api), PERIOD_BETWEEN_SYNCS);
}

async function syncWithMs1(models, syncQueue, ms1Api) {
  await pushLatest(models, syncQueue, ms1Api); // Push the next most recent batch of survey responses
}

export async function pushLatest(models, syncQueue, ms1Api) {
  // Get the latest changes for this aggregation server
  const latestChanges = await syncQueue.get(MAX_BATCH_SIZE);

  const pushedChanges = [];
  for (let i = 0; i < latestChanges.length; i += 1) {
    const change = latestChanges[i];
    try {
      const successfullyPushed = await pushChange(models, change, ms1Api);

      // If it has synced to MS1 API, remove the change from the sync queue
      if (successfullyPushed === true) {
        await syncQueue.use(change);
      }
    } catch (error) {
      await addToSyncLog(models, change, error.message, error.endpoint, error.data);
      if (
        (error instanceof HttpError && INVALID_HTTP_CODES.includes(error.status)) ||
        error.message === ENDPOINT_NOT_FOUND
      ) {
        // in this case clear up the poor request
        await syncQueue.registerBadRequest(change);
      }
      // This could be a poor connection so will repeat forever
      await syncQueue.deprioritise(change);
    }
  }
  return pushedChanges;
}
export async function pushChange(models, change, ms1Api) {
  const { details = {} } = change;
  const { surveyCode = {}, organisationUnitCode = {} } = details;

  const entity = await models.entity.findOne({ code: organisationUnitCode });
  const distributionId = get(entity, 'metadata.ms1.distributionId');

  const surveyResponse = await models.surveyResponse.findOne({ id: change.record_id });
  if (!surveyResponse) {
    throw new Error(`MS1 Survey response: ${change.record_id} not found.`);
  }
  const survey = await models.survey.findOne({ code: surveyCode });
  const { integration_metadata: integrationMetadata } = survey;
  if (!integrationMetadata.ms1) {
    throw new Error(`No MS1 endpoint mapping for survey code: ${surveyCode}.`);
  }
  const { endpoint } = integrationMetadata.ms1;

  if (!endpoint) {
    throw new Error(`MS1 endpoint mapping for survey code: ${surveyCode} not found.`);
  }
  if (!distributionId) {
    throw new Error(`MS1 mapping for clinic: ${organisationUnitCode} not found.`);
  }

  const surveyResponseId = surveyResponse.id;

  const { assessor_name: sentBy, data_time: sentAt } = surveyResponse;
  const metadata = {
    sentBy,
    sentAt,
  };
  const answers = await models.answer.find({
    survey_response_id: surveyResponseId,
  });
  const questions = await findQuestionsInSurvey(models, surveyResponse.survey_id);
  const questionIdToMs1Variable = {};
  questions.forEach(question => {
    if (!question.name) return;
    questionIdToMs1Variable[question.id] = generateMs1VariableName(question.name);
  });

  const questionIds = questions.map(question => question.id);
  let body = { distributionId };
  answers.forEach(answer => {
    if (!questionIds.includes(answer.question_id)) {
      winston.info(
        `Skipping answer:${answer.id} as question_id:${answer.question_id} is not in survey:${surveyResponse.survey_id}`,
      );
      return;
    }

    body = {
      ...body,
      ...findParam(answer, questionIdToMs1Variable),
    };
  });
  const data = {
    payload: body,
    metadata,
  };
  try {
    const response = await (endpoint.method === 'POST'
      ? ms1Api.postData(data, endpoint.route)
      : ms1Api.putData(data, endpoint.route));
    await addToSyncLog(models, change, null, endpoint, data);
  } catch (error) {
    error.data = data;
    error.endpoint = endpoint;
    throw error;
  }

  return true;
}

function findParam(answer, questions) {
  const questionVariableName = questions[answer.question_id];
  if (!questionVariableName)
    throw new Error(`Question for ${answer.question_id} does not map to a variable name`);
  const fieldName = questionVariableName;

  return { [fieldName]: answer.text };
}
