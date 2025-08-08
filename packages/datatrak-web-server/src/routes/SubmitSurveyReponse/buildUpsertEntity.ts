import { generateId } from '@tupaia/database';
import { ajvValidate, objectEntries } from '@tupaia/tsutils';
import {
  DatatrakWebSubmitSurveyResponseRequest,
  Entity,
  SurveyScreenComponentConfig,
  EntityUpdate,
  EntityUpdateSchema,
  EntityQuestionConfigFieldValue,
} from '@tupaia/types';
import { DatatrakWebServerModelRegistry } from '../../types';

type Answers = DatatrakWebSubmitSurveyResponseRequest.ReqBody['answers'];

const isQuestionValue = (
  configValue?: EntityQuestionConfigFieldValue,
): configValue is { questionId: string } => {
  return !!(configValue && typeof configValue === 'object' && 'questionId' in configValue);
};

export const buildUpsertEntity = async (
  models: DatatrakWebServerModelRegistry,
  config: SurveyScreenComponentConfig,
  questionId: string,
  answers: Answers,
  countryId: Entity['id'],
) => {
  const entityId = answers[questionId] || generateId();

  // throw an error if the entity id is configured to use a non-string value
  if (typeof entityId !== 'string')
    throw new Error(`Entity id must be a string, but received ${entityId}`);

  const entity: Record<string, unknown> = { id: entityId };
  const fields = config?.entity?.fields;

  if (fields) {
    for (const [fieldName, value] of objectEntries(fields)) {
      // Value is not defined, skip
      if (value === undefined) {
        return;
      }

      const getFieldValue = () => {
        if (isQuestionValue(value)) {
          const { questionId } = value;
          return answers[questionId];
        }
        return value;
      };

      const fieldValue = getFieldValue();

      if (fieldName === 'parentId') {
        // If the parentId field is not answered, use the country id
        const parentValue = fieldValue || countryId;
        // throw an error if the question is configured to use a non-string value
        if (typeof parentValue !== 'string')
          throw new Error(`Parent id must be a string, but received ${parentValue}`);
        const entityRecord = await models.entity.findById(parentValue);
        entity.parent_id = entityRecord.id;
      } else {
        entity[fieldName] = fieldValue;
      }
    }
  }

  const isUpdate = await models.entity.findById(entityId);

  if (isUpdate) {
    return entity;
  }

  const selectedCountry = await models.entity.findById(countryId);
  if (!entity.country_code) {
    entity.country_code = selectedCountry.code;
  }
  if (!entity.parent_id) {
    entity.parent_id = selectedCountry.id;
  }
  if (!entity.code) {
    entity.code = entityId;
  }

  const validatedEntity = ajvValidate<EntityUpdate>(EntityUpdateSchema, entity);

  return validatedEntity;
};
