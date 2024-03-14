/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { generateId } from '@tupaia/database';
import { objectEntries } from '@tupaia/tsutils';
import { DatatrakWebSubmitSurveyRequest, Entity, SurveyScreenComponentConfig } from '@tupaia/types';
import { DatatrakWebServerModelRegistry } from '../../types';

type Answers = DatatrakWebSubmitSurveyRequest.ReqBody['answers'];

type EntityFieldValue = Entity[keyof Entity];

//TODO: add type here
const isQuestionValue = (value: any): value is { questionId: string } => {
  return value && 'questionId' in value;
};

export const buildUpsertEntity = async (
  models: DatatrakWebServerModelRegistry,
  config: SurveyScreenComponentConfig,
  questionId: string,
  answers: Answers,
  countryId: Entity['id'],
) => {
  const entityId = (answers[questionId] || generateId()) as Entity['id'];
  const entity = { id: entityId } as Entity;
  const fields = config?.entity?.fields;

  if (fields) {
    for (const [fieldName, value] of objectEntries(fields)) {
      // Value is not defined, skip
      if (value === undefined) {
        return;
      }

      const getFieldValue = () => {
        if (typeof value === 'string') {
          return value;
        }
        if (isQuestionValue(value)) {
          const { questionId } = value;
          return answers[questionId];
        }
        return undefined;
      };

      const fieldValue = getFieldValue();

      if (fieldName === 'parentId') {
        // If the parentId field is not answered, use the country id
        const parentValue = (fieldValue as string) || countryId;
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

  return entity;
};
