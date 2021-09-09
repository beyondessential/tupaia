/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';
import { DataBroker } from '@tupaia/data-broker';
import { generateId } from '@tupaia/database';

const PERIOD_BETWEEN_SYNCS = 10 * 60 * 1000; // 10 minutes between syncs
const SERVICE_TYPE = 'kobo';

export async function startSyncWithKoBo(models) {
  if (process.env.KOBO_SYNC_DISABLE === 'true') {
    // eslint-disable-next-line no-console
    console.log('KoBo sync is disabled');
  } else {
    const dataBroker = new DataBroker();
    const koboSyncServices = await models.syncService.find({ service_type: SERVICE_TYPE });
    koboSyncServices.forEach(service =>
      setInterval(() => syncWithKoBo(models, dataBroker, service.code), PERIOD_BETWEEN_SYNCS),
    );
  }
}

export async function syncWithKoBo(models, dataBroker, serviceCode) {
  const syncService = await models.syncService.findOne({
    service_type: SERVICE_TYPE,
    code: serviceCode,
  });

  if (!syncService) {
    throw new Error(`No KoBo sync service with the code ${serviceCode} exists`);
  }

  // Pull data from KoBo
  const koboData = await dataBroker.pull(
    {
      code: syncService.config.koboSurveys,
      type: dataBroker.getDataSourceTypes().SYNC_GROUP,
    },
    {
      startSubmissionTime: syncService.sync_cursor,
    },
  );

  const apiUser = await models.apiClient.findOne({ username: process.env.KOBO_API_USERNAME });
  if (!apiUser) {
    throw new Error('Cannot find API client user for KoBo');
  }

  // Create new survey_responses
  let newSyncTime = syncService.sync_cursor;
  await models.wrapInTransaction(async transactingModels => {
    for (const koboSyncResponse of koboData) {
      for (const [surveyCode, responses] of Object.entries(koboSyncResponse)) {
        const survey = await transactingModels.survey.findOne({ code: surveyCode });

        for (const responseData of responses) {
          if (responseData.eventDate > newSyncTime) {
            newSyncTime = responseData.eventDate;
          }
          const entity = await transactingModels.entity.findOne({ code: responseData.orgUnit });
          if (!entity) {
            await syncService.log(
              `Skipping KoBo sync for record id ${responseData.event}: unknown entity ${responseData.orgUnit}`,
            );
            continue;
          }

          const surveyResponse = await transactingModels.surveyResponse.create({
            id: generateId(),
            survey_id: survey.id,
            user_id: apiUser.user_account_id,
            assessor_name: responseData.assessor || 'KoBo Integration',
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
    }
  });

  // Update sync cursor
  await models.syncService.update({ id: syncService.id }, { sync_cursor: newSyncTime });
}
