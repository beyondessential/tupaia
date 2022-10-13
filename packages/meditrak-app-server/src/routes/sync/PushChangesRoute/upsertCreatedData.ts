import { DatabaseError } from '@tupaia/utils';
import { MeditrakAppServerModelRegistry } from '../../../types';
import {
  ValidatedSurveyResponseObject,
  ValidatedEntitiesObject,
  ValidatedOptionsObject,
} from './validateInboundSurveyResponses';

const createEntities = async (
  models: MeditrakAppServerModelRegistry,
  entitiesCreated: ValidatedEntitiesObject[],
  surveyId: string,
) => {
  const survey = await models.survey.findById(surveyId);
  const dataGroup = await survey.dataGroup();

  return Promise.all(
    entitiesCreated.map(async entity =>
      models.entity.updateOrCreate(
        { id: entity.id },
        {
          ...entity,
          metadata:
            dataGroup.service_type === 'dhis'
              ? { dhis: { isDataRegional: !!dataGroup.config.isDataRegional } }
              : {},
        },
      ),
    ),
  );
};

const createOptions = async (
  models: MeditrakAppServerModelRegistry,
  optionsCreated: ValidatedOptionsObject[],
) => {
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

// Upsert data that were created in user's local database
export const upsertCreatedData = async (
  models: MeditrakAppServerModelRegistry,
  surveyResponse: ValidatedSurveyResponseObject,
) => {
  const entitiesCreated = surveyResponse.entities_created || [];
  const optionsCreated = surveyResponse.options_created || [];
  try {
    await createEntities(models, entitiesCreated, surveyResponse.survey_id);
    await createOptions(models, optionsCreated);
  } catch (error) {
    throw new DatabaseError(
      `creating/updating created data from survey response with id ${surveyResponse.survey_id}`,
      error,
    );
  }
};
