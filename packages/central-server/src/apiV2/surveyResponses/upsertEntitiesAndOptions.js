/** @typedef {import('@tupaia/types').MeditrakSurveyResponseRequest} SurveyResponse */

import { DatabaseError } from '@tupaia/utils';

/**
 * @param {import('@tupaia/database').ModelRegistry} models
 * @param {SurveyResponse['entities_upserted']} entitiesUpserted
 * @param {import('@tupaia/types').Survey['id']} surveyId
 * @returns {Promise<Array<import('@tupaia/database').EntityRecord>>}
 */
const upsertEntities = async (models, entitiesUpserted, surveyId) => {
  /** @type {import('@tupaia/database').SurveyRecord} */
  const survey = await models.survey.findById(surveyId);
  const dataGroup = await survey.dataGroup();

  return await Promise.all(
    entitiesUpserted.map(async entity => {
      const existingEntity = await models.entity.findById(entity.id);

      const existingMetadata = existingEntity?.metadata || {};

      return models.entity.updateOrCreate(
        { id: entity.id },
        {
          ...entity,
          metadata:
            dataGroup.service_type === 'dhis'
              ? {
                  ...existingMetadata,
                  dhis: {
                    ...existingMetadata?.dhis,
                    isDataRegional: !!dataGroup.config.isDataRegional,
                  },
                }
              : {},
        },
      );
    }),
  );
};

/**
 * @param {import('@tupaia/database').ModelRegistry} models
 * @param {import('@tupaia/types').MeditrakSurveyResponseRequest['options_created']} optionsCreated
 * @returns {Promise<Array<import('@tupaia/database').OptionRecord>>}
 */
const createOptions = async (models, optionsCreated) => {
  /** @type {import('@tupaia/database').OptionRecord[]} */
  const options = [];
  for (const optionObject of optionsCreated) {
    const { value, option_set_id: optionSetId } = optionObject;

    /** @type {number} */
    const maxSortOrder = (await models.option.getLargestSortOrder(optionSetId)) ?? 0;

    /** @type {import('@tupaia/database').OptionRecord} */
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
 * @param {import('@tupaia/database').ModelRegistry} models
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

      if (optionsCreated.length > 0) {
        await createOptions(models, optionsCreated);
      }
    } catch (error) {
      throw new DatabaseError(
        `creating/updating created data from survey response with id ${surveyResponse.survey_id}`,
        error,
      );
    }
  }
};
