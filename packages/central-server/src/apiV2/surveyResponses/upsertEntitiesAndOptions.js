/** @typedef {import('@tupaia/types').MeditrakSurveyResponseRequest} SurveyResponse */

import { DatabaseError } from '@tupaia/utils';

/**
 * @param {import('@tupaia/database').ModelRegistry} models
 * @param {SurveyResponse['entities_upserted']} entitiesUpserted
 * @param {import('@tupaia/types').Survey['id']} surveyId
 * @returns {Promise<Array<import('@tupaia/database').EntityRecord>>}
 */
const upsertEntities = async (models, entitiesUpserted, surveyId) => {
  if (entitiesUpserted.length === 0) return [];

  /** @type {import('@tupaia/database').SurveyRecord} */
  const survey = await models.survey.findById(surveyId);
  const dataGroup = await survey.dataGroup();

  return await Promise.all(
    entitiesUpserted.map(async entity => {
      const existingEntity = await models.entity.findById(entity.id);

      const existingMetadata = existingEntity?.metadata || {};
      const metadata =
        dataGroup.service_type === 'dhis'
          ? {
              ...existingMetadata,
              dhis: {
                ...existingMetadata?.dhis,
                isDataRegional: !!dataGroup.config.isDataRegional,
              },
            }
          : {};

      return models.entity.updateOrCreate({ id: entity.id }, { ...entity, metadata });
    }),
  );
};

/**
 * @param {import('@tupaia/database').ModelRegistry} models
 * @param {import('@tupaia/types').MeditrakSurveyResponseRequest['options_created']} optionsCreated
 * @returns {Promise<Array<import('@tupaia/database').OptionRecord>>}
 */
const createOptions = async (models, optionsCreated) => {
  if (optionsCreated.length === 0) return [];

  /** @type {import('@tupaia/database').OptionRecord[]} */
  const options = [];
  for (const optionObject of optionsCreated) {
    const { value, option_set_id: optionSetId } = optionObject;
    /** @type {Pick<import('@tupaia/types').Option, 'option_set_id' | 'value'>} */
    const whereClause = { option_set_id: optionSetId, value };

    /** @type {import('@tupaia/database').OptionRecord | null} */
    const existingOption = await models.option.findOne(whereClause);
    /** @type {number} */
    const sortOrder =
      existingOption?.sort_order ??
      ((await models.option.getLargestSortOrder(optionSetId)) ?? 0) + 1;

    /** @type {import('@tupaia/database').OptionRecord} */
    const optionRecord = await models.option.updateOrCreate(whereClause, {
      ...optionObject,
      sort_order: sortOrder,
    });

    options.push(optionRecord);
  }

  return options;
};

/**
 * Upsert entities and options that were created in user's local database
 * @param {import('@tupaia/database').ModelRegistry} models
 * @param {SurveyResponse | SurveyResponse[]} surveyResponses
 */
export const upsertEntitiesAndOptions = async (models, surveyResponses) => {
  const responses = Array.isArray(surveyResponses) ? surveyResponses : [surveyResponses];

  for (const surveyResponse of responses) {
    const entitiesUpserted = surveyResponse.entities_upserted ?? [];
    const optionsCreated = surveyResponse.options_created ?? [];

    try {
      await upsertEntities(models, entitiesUpserted, surveyResponse.survey_id);
      await createOptions(models, optionsCreated);
    } catch (error) {
      throw new DatabaseError(
        `creating/updating created data from survey response with id ${surveyResponse.survey_id}`,
        error,
      );
    }
  }
};
