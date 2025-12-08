/**
 * @typedef {import('@tupaia/database').ModelRegistry} ModelRegistry
 * @typedef {import('@tupaia/database').OptionRecord} OptionRecord
 * @typedef {import('@tupaia/types').MeditrakSurveyResponseRequest} SurveyResponse
 */

import winston from '../../log';

/**
 * @param {ModelRegistry} models
 * @param {SurveyResponse['entities_upserted']} entitiesUpserted
 * @param {import('@tupaia/types').Survey['id']} surveyId
 * @returns {Promise<import('@tupaia/database').EntityRecord[]>}
 */
const upsertEntities = async (models, entitiesUpserted, surveyId) => {
  /** @type {import('@tupaia/database').SurveyRecord} */
  const survey = await models.survey.findById(surveyId);
  const dataGroup = await survey.dataGroup();

  return await Promise.all(
    entitiesUpserted.map(async entity => {
      const [{ exists }] = await models.database.executeSql(
        'SELECT EXISTS (SELECT 1 FROM entity WHERE id = ?);',
        [entity.id],
      );

      const entityToPersist = { ...entity };
      if (dataGroup.service_type === 'dhis') {
        entityToPersist.dhis ??= {};
        entityToPersist.dhis.isDataRegional = Boolean(dataGroup.config.isDataRegional);
      }

      // Not using `updateOrCreate` because underlying `INSERT ... ON CONFLICT` query requires all
      // NOT NULL attributes to be provided, but (unlike MediTrak) DataTrak only provides attributes
      // that need updating. `update`/`updateById` is happy with partial data.
      if (exists) return await models.entity.updateById(entity.id, entityToPersist);
      return await models.entity.create(entityToPersist);
    }),
  );
};

/**
 * @param {import('@tupaia/database').ModelRegistry} models
 * @param {SurveyResponse['options_created']} optionsCreated
 * @returns {Promise<OptionRecord[]>}
 */
const createOptions = async (models, optionsCreated) => {
  /** @type {OptionRecord[]} */
  const options = [];
  for (const optionObject of optionsCreated) {
    const { value, option_set_id: optionSetId } = optionObject;

    /** @type {number} */
    const maxSortOrder = (await models.option.getLargestSortOrder(optionSetId)) ?? 0;

    /** @type {OptionRecord} */
    const optionRecord = await models.option.updateOrCreate(
      { option_set_id: optionSetId, value },
      {
        ...optionObject,
        sort_order: maxSortOrder + 1,
        attributes: {},
      },
    );

    options.push(optionRecord);
  }

  return options;
};

/**
 * Upsert entities and options that were created in user's local database
 * @param {ModelRegistry} models
 * @param {SurveyResponse[]} surveyResponses
 */
export const upsertEntitiesAndOptions = async (models, surveyResponses) => {
  for (const surveyResponse of surveyResponses) {
    const entitiesUpserted = surveyResponse.entities_upserted || [];
    const optionsCreated = surveyResponse.options_created || [];

    try {
      if (entitiesUpserted.length > 0) {
        await upsertEntities(models, entitiesUpserted, surveyResponse.survey_id);
      }
    } catch (error) {
      winston.error(
        `Error upserting entities from survey response ${surveyResponse.id} for survey ${surveyResponse.survey_id}`,
      );
      throw error;
    }

    try {
      if (optionsCreated.length > 0) {
        await createOptions(models, optionsCreated);
      }
    } catch (error) {
      winston.error(
        `Error creating options from survey response ${surveyResponse.id} for survey ${surveyResponse.survey_id}`,
      );
      throw error;
    }
  }
};
