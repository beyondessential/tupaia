/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';
import { DataBroker } from '@tupaia/data-broker';
import { generateId } from '@tupaia/database';
import winston from '../log';

const PERIOD_BETWEEN_SYNCS = 10 * 60 * 1000; // 10 minutes between syncs
const SERVICE_TYPE = 'kobo';

const writeKoboDataToTupaia = async (transactingModels, koboData, syncGroupCode) => {
  const dataServiceSyncGroup = await transactingModels.dataServiceSyncGroup.findOne({
    service_type: SERVICE_TYPE,
    code: syncGroupCode,
  });
  const apiUser = await transactingModels.apiClient.findOne({
    username: process.env.KOBO_API_USERNAME,
  });

  if (!apiUser) {
    throw new Error('Cannot find API client user for KoBo');
  }

  let newSyncTime = dataServiceSyncGroup.sync_cursor;
  let numberOfSurveyResponsesCreated = 0;
  for (const koboSyncResponse of koboData) {
    for (const [surveyCode, responses] of Object.entries(koboSyncResponse)) {
      const survey = await transactingModels.survey.findOne({ code: surveyCode });

      for (const responseData of responses) {
        if (responseData.eventDate > newSyncTime) {
          newSyncTime = responseData.eventDate;
        }
        const entity = await transactingModels.entity.findOne({ code: responseData.orgUnit });
        if (!entity) {
          await dataServiceSyncGroup.log(
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

        numberOfSurveyResponsesCreated += 1;
      }
    }
  }

  return { newSyncTime, numberOfSurveyResponsesCreated };
};

export async function syncWithKoBo(models, dataBroker, syncGroupCode) {
  const dataServiceSyncGroup = await models.dataServiceSyncGroup.findOne({
    service_type: SERVICE_TYPE,
    code: syncGroupCode,
  });

  if (!dataServiceSyncGroup) {
    throw new Error(`No KoBo sync service with the code ${syncGroupCode} exists`);
  }

  try {
    // Pull data from KoBo
    const koboData = await dataBroker.pull(
      {
        code: syncGroupCode,
        type: dataBroker.getDataSourceTypes().SYNC_GROUP,
      },
      {
        startSubmissionTime: dataServiceSyncGroup.sync_cursor,
      },
    );

    await models.wrapInTransaction(async transactingModels => {
      // Create new survey_responses in Tupaia
      const { newSyncTime, numberOfSurveyResponsesCreated } = await writeKoboDataToTupaia(
        transactingModels,
        koboData,
        syncGroupCode,
      );

      // Update sync cursor
      await transactingModels.dataServiceSyncGroup.update(
        { id: dataServiceSyncGroup.id },
        { sync_cursor: newSyncTime },
      );

      await dataServiceSyncGroup.log(
        `Sync successful, ${numberOfSurveyResponsesCreated} survey responses created`,
      );
    });
  } catch (e) {
    // Swallow errors when processing kobo data
    await dataServiceSyncGroup.log(`ERROR: ${e.message}`);
    winston.error(e.message);
  }
}

export async function startSyncWithKoBo(models) {
  if (process.env.KOBO_SYNC_DISABLE === 'true') {
    // eslint-disable-next-line no-console
    console.log('KoBo sync is disabled');
  } else {
    const dataBroker = new DataBroker();
    const koboDataServiceSyncGroups = await models.dataServiceSyncGroup.find({
      service_type: SERVICE_TYPE,
    });
    koboDataServiceSyncGroups.forEach(dssg =>
      setInterval(() => syncWithKoBo(models, dataBroker, dssg.code), PERIOD_BETWEEN_SYNCS),
    );
  }
}
