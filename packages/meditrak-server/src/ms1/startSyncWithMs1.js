/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 **/
import { get } from 'lodash';
import { HttpError } from '@tupaia/utils';

import { ENTITY_TYPES } from '../database/models/Entity';
import { ExternalApiSyncQueue } from '../database/ExternalApiSyncQueue';
import { Ms1Api } from './api/Ms1Api';
import { addToSyncLog } from './addToSyncLog';
import { generateMs1VariableName } from './utilities/generateMs1VariableName';
import { findQuestionsBySurvey } from '../dataAccessors/findQuestionsBySurvey';
import { generateChangeRecordAdditions } from './syncQueue';
const PERIOD_BETWEEN_SYNCS = 1 * 60 * 1000; // 1 minute between syncs
const MAX_BATCH_SIZE = 10;
const INVALID_HTTP_CODES = [400, 500];
const ENDPOINT_NOT_FOUND = 'Endpoint not found to send data to MS1';

export async function startSyncWithMs1(models) {
  const demolandEntityIds = (await models.entity.find({ country_code: 'DL' })).map(({ id }) => id);
  const ms1SurveyIds = ['xx']; // TODO fetch from db using integration_metadata::text LIKE '%"ms1":%"endpoint":%`
  const validator = async changes => {
    // Deal with the edge case of deletes first, as we don't have the usual information in the db
    const validations = changes.map(async change => {
      if (change.type === 'delete') {
        const { record_id: recordId } = change;
        const existingSyncQueueRecord = await models.ms1SyncQueue.findOne({ record_id: recordId });
        // If there is a sync queue record with this record_id, the delete record must be valid for ms1
        return !!existingSyncQueueRecord;
      }
      const surveyResponse = await models.surveyResponse.findOne({ id: change.record_id });
      if (!surveyResponse) return false;

      // ditch if demoland
      if (demolandEntityIds.includes(surveyResponse.entity_id)) return false;

      // only include responses for ms1 surveys
      if (ms1SurveyIds.includes(surveyResponse.survey_id)) return false;
      return true;
    });
    return Promise.all(validations);
  };

  const subscriptions = [models.surveyResponse.databaseType];
  // Syncs  changes to MS1 aggregation servers
  const syncQueue = new ExternalApiSyncQueue(
    models,
    validator,
    subscriptions,
    generateChangeRecordAdditions,
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
        (error instanceof HttpError && INVALID_HTTP_CODES.indexOf(error.status) !== -1) ||
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

  const { assessor_name: sentBy, submission_time: sentAt } = surveyResponse;
  const metadata = {
    sentBy,
    sentAt,
  };
  const answers = await models.answer.find({
    survey_response_id: surveyResponseId,
  });
  const questions = await findQuestionsBySurvey(models, { survey_id: surveyResponse.survey_id });
  const questionIdToMs1Variable = {};
  questions.forEach(question => {
    if (!question.indicator) return;
    questionIdToMs1Variable[question.id] = generateMs1VariableName(question.indicator);
  });

  let body = { distributionId };
  answers.forEach(answer => {
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
    throw new Error(`Question for ${fieldName} does not map to a variable name`);
  const fieldName = questionVariableName;

  return { [fieldName]: answer.text };
}
