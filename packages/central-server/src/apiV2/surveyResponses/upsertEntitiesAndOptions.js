import { DatabaseError } from '@tupaia/utils';

const upsertEntities = async (models, entitiesUpserted, surveyId) => {
  const survey = await models.survey.findById(surveyId);
  const dataGroup = await survey.dataGroup();

  return Promise.all(
    entitiesUpserted.map(async entity => {
      const existingEntity = await models.entity.findOne({ id: entity.id });

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

const createOptions = async (models, optionsCreated) => {
  const options = [];

  for (const optionObject of optionsCreated) {
    const { value, option_set_id: optionSetId } = optionObject;
    const largestSorOrder = await models.option.getLargestSortOrder(optionSetId);
    const optionRecord = await models.option.updateOrCreate(
      { option_set_id: optionSetId, value },
      {
        ...optionObject,
        sort_order: largestSorOrder + 1, // append the option to the end to resolve any sort order conflict from other devices
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
