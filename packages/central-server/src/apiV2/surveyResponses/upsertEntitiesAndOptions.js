/**
 * @typedef {import('@tupaia/database').EntityRecord} EntityRecord
 * @typedef {import('@tupaia/database').ModelRegistry} ModelRegistry
 * @typedef {import('@tupaia/types').MeditrakSurveyResponseRequest} SurveyResponse
 * @typedef {import('@tupaia/types').Survey} Survey
 */

import { uniqBy } from 'es-toolkit';

import { DatabaseError } from '@tupaia/utils';

/**
 * @param {ModelRegistry} models
 * @param {SurveyResponse['entities_upserted']} entitiesUpserted
 * @param {Survey['id']} surveyId
 * @returns {Promise<EntityRecord[]>}
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
 * @param {Pick<import('@tupaia/types').Option, 'option_set_id' | 'value'>} option
 * @returns {string}
 * @privateRemarks Not a true hash, but perfectly serviceable for {@link createOptions}. (Small
 * input change does not result in large output change.)
 */
function hashOption({ option_set_id, value }) {
  // option_set_id known to be 24-chars, so not worried about different (option_set_id, value)
  // pairs colliding. e.g. Collision between ('foo', 'bar') and ('foob', 'ar') won’t happen.
  return `${option_set_id}${value.trim()}`;
}

/**
 * @param {import('@tupaia/database').ModelRegistry} models
 * @param {import('@tupaia/types').MeditrakSurveyResponseRequest['options_created']} optionsCreated
 * @returns {Promise<Array<import('@tupaia/database').OptionRecord>>}
 */
const createOptions = async (models, optionsCreated) => {
  if (optionsCreated.length === 0) return [];

  const uniqueOptionsCreated = uniqBy(optionsCreated, hashOption);

  /** @type {import('@tupaia/database').OptionRecord[]} */
  const options = [];
  for (const optionObject of uniqueOptionsCreated) {
    const optionSetId = optionObject.option_set_id;
    const label =
      typeof optionObject.label === 'string' ? optionObject.label.trim() : optionObject.label;
    const value = optionObject.value.trim();

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
      label,
      sort_order: sortOrder,
      value,
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
