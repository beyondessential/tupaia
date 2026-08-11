import { keyBy } from 'es-toolkit/compat';

import { DataBroker } from '@tupaia/data-broker';
import { generateId } from '@tupaia/database';

import winston from '../log';

const PERIOD_BETWEEN_SYNCS = 10 * 60 * 1000; // 10 minutes between syncs
const SERVICE_TYPE = 'kobo';

const validateSyncGroup = async (models, dataServiceSyncGroup) => {
  const { data_group_code: dataGroupCode, config } = dataServiceSyncGroup;

  const survey = await models.survey.findOne({ code: dataGroupCode });
  if (!survey) {
    throw new Error(
      `No survey exists in Tupaia with code matching data_group_code: ${dataGroupCode}`,
    );
  }

  const questionCodesInQuestionMapping = Object.keys(config.questionMapping || {});
  const questions = await models.question.find({
    code: questionCodesInQuestionMapping,
  });
  const questionCodes = questions.map(q => q.code);
  const questionsNotDefinedInTupaia = questionCodesInQuestionMapping.filter(
    q => !questionCodes.includes(q),
  );

  if (questionsNotDefinedInTupaia.length > 0) {
    throw new Error(
      `Question codes in sync group questionMapping do not match any existing questions in Tupaia: ${questionsNotDefinedInTupaia}`,
    );
  }
};

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
  for (const [surveyCode, responses] of Object.entries(koboData)) {
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

  return { newSyncTime, numberOfSurveyResponsesCreated };
};

export async function syncWithKoBo(models, dataBroker, syncGroupCode) {
  const dataServiceSyncGroup = await models.dataServiceSyncGroup.findOne({
    service_type: SERVICE_TYPE,
    code: syncGroupCode,
  });

  if (!dataServiceSyncGroup) {
    throw new Error(`No KoBo sync group with the code ${syncGroupCode} exists`);
  }

  if (dataServiceSyncGroup.isSyncing()) {
    winston.info(`Already syncing ${dataServiceSyncGroup.code}, skipping sync request`);
    return;
  }

  try {
    await dataServiceSyncGroup.setSyncStarted();

    await validateSyncGroup(models, dataServiceSyncGroup);

    // Pull data from KoBo
    const koboData =
      (await dataBroker.pullSyncGroupResults([syncGroupCode], {
        startSubmissionTime: dataServiceSyncGroup.sync_cursor,
      })) || {};

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

    await dataServiceSyncGroup.setSyncCompletedSuccessfully();
  } catch (e) {
    // Swallow errors when processing kobo data
    await dataServiceSyncGroup.log(`ERROR: ${e.message}`);
    await dataServiceSyncGroup.setSyncFailed();
    winston.error(e.message);
  }
}

export async function startSyncWithKoBo(models) {
  if (process.env.KOBO_SYNC_DISABLE === 'true') {
    winston.info('KoBo sync is disabled');
  } else {
    const dataBroker = new DataBroker();
    const koboDataServiceSyncGroups = await models.dataServiceSyncGroup.find({
      service_type: SERVICE_TYPE,
    });

    // Put all kobo sync groups in an idle state, just in case they're stuck in an 'syncing' state due to a server shutdown
    await Promise.all(koboDataServiceSyncGroups.map(async syncGroup => syncGroup.setSyncIdle()));

    koboDataServiceSyncGroups.forEach(dssg =>
      setInterval(() => syncWithKoBo(models, dataBroker, dssg.code), PERIOD_BETWEEN_SYNCS),
    );
  }
}
