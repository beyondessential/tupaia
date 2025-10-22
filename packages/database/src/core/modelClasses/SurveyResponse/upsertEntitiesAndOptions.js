import { merge } from 'es-toolkit';

import { DatabaseError } from '@tupaia/utils';

const upsertEntities = async (models, entitiesUpserted) => {
  return await Promise.all(
    entitiesUpserted.map(async entity => {
      const existingEntity = await models.entity.findOne({ id: entity.id });

      const existingMetadata = existingEntity?.metadata || {};
      const newMetadata = entity.metadata || {};
      const metadata = merge(existingMetadata, newMetadata);

      return models.entity.updateOrCreate({ id: entity.id }, { ...entity, metadata });
    }),
  );
};

const createOptions = async (models, optionsCreated) => {
  const options = [];

  for (const optionObject of optionsCreated) {
    const { value, option_set_id: optionSetId } = optionObject;
    const maxSortOrder = (await models.option.getLargestSortOrder(optionSetId)) ?? 0;
    const optionRecord = await models.option.updateOrCreate(
      { option_set_id: optionSetId, value },
      {
        ...optionObject,
        sort_order: maxSortOrder + 1, // append the option to the end to resolve any sort order conflict from other devices
        attributes: {},
      },
    );
    options.push(optionRecord);
  }

  return options;
};

// Upsert entities and options that were created in user's local database
export const upsertEntitiesAndOptions = async (models, surveyResponses) => {
  for (const surveyResponse of surveyResponses) {
    const entitiesUpserted = surveyResponse.entities_upserted || [];
    const optionsCreated = surveyResponse.options_created || [];

    try {
      if (entitiesUpserted.length > 0) {
        await upsertEntities(models, entitiesUpserted);
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
