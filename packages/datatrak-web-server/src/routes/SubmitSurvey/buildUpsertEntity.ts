/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { generateId } from '@tupaia/database';
import { DatatrakWebSubmitSurveyRequest, Entity, SurveyScreenComponentConfig } from '@tupaia/types';
import { DatatrakWebServerModelRegistry } from '../../types';

type Answers = DatatrakWebSubmitSurveyRequest.ReqBody['answers'];

export const buildUpsertEntity = async (
  models: DatatrakWebServerModelRegistry,
  config: SurveyScreenComponentConfig,
  questionId: string,
  answers: Answers,
  countryId: Entity['id'],
) => {
  const entityId = (answers[questionId] || generateId()) as Entity['id'];
  const entity = { id: entityId } as Entity;
  const fields = config?.entity?.fields || {};

  for (const [fieldName, value] of Object.entries(fields)) {
    // Value is not defined, skip
    if (value === undefined) {
      return;
    }

    const fieldValue = typeof value === 'string' ? value : answers[value.questionId];

    if (fieldName === 'parentId') {
      // If the parentId field is not answered, use the country id
      const parentValue = (fieldValue as string) || countryId;
      const entityRecord = await models.entity.findById(parentValue);
      entity.parent_id = entityRecord.id;
    } else {
      entity[fieldName as keyof Entity] = fieldValue;
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
