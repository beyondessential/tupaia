/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';
import { DataBroker } from '@tupaia/data-broker';
import { generateId } from '@tupaia/database';

// TODO:
// - REST endpoint: Manual

const PERIOD_BETWEEN_SYNCS = 1 * 60 * 1000; // 1 minutes between syncs
const SERVICE_NAME = 'KoBo';

export async function startSyncWithKoBo(models) {
  // TODO: Allow disabling of KoBo sync
  // TODO: Can KoBo and DHIS share a dataBroker?
  const dataBroker = new DataBroker();
  setInterval(() => syncWithKoBo(models, dataBroker), PERIOD_BETWEEN_SYNCS);
}

async function syncWithKoBo(models, dataBroker) {
  await pullLatest(models, dataBroker);
}

async function pullLatest(models, dataBroker) {
  const syncCursor = await models.syncCursor.findOne({ service_name: SERVICE_NAME });

  // Pull data from KoBo
  const koboData = await dataBroker.pull(
    {
      code: syncCursor.config.koboSurveys,
      type: dataBroker.getDataSourceTypes().SYNC_GROUP,
    },
    {
      startSubmissionTime: syncCursor.sync_time,
    },
  );

  // Create new survey_responses
  let newSyncTime = syncCursor.sync_time;
  await models.wrapInTransaction(async transactingModels => {
    for (const [surveyCode, responses] of Object.entries(koboData)) {
      const survey = await transactingModels.survey.findOne({ code: surveyCode });

      for (const responseData of responses) {
        if (responseData.eventDate > newSyncTime) {
          newSyncTime = responseData.eventDate;
        }
        const entity = await transactingModels.entity.findOne({ code: responseData.orgUnit });

        const surveyResponse = await transactingModels.surveyResponse.create({
          id: generateId(),
          survey_id: survey.id,
          // user_id: '', // TODO: Pull this from an API user
          assessor_name: 'KoBo Integration',
          entity_id: entity.id,
          start_time: responseData.eventDate,
          end_time: responseData.eventDate,
          data_time: responseData.eventDate,
        });

        const questions = await transactingModels.question.find({
          code: Object.keys(responseData.dataValues),
        });
        const questionByCode = keyBy(questions, 'code');

        await transactingModels.answer.createMany(
          Object.entries(responseData.dataValues).map(([questionCode, answer]) => ({
            id: generateId(),
            type: questionByCode[questionCode].type,
            survey_response_id: surveyResponse.id,
            question_id: questionByCode[questionCode].id,
            text: answer,
          })),
        );
      }
    }
  });

  // Update sync cursor
  await models.syncCursor.update({ id: syncCursor.id }, { sync_time: newSyncTime });
}
