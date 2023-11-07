/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { generateId } from '@tupaia/database';
import {
  DatatrakWebSubmitSurveyRequest,
  Entity,
  Country,
  SurveyScreenComponentConfig,
} from '@tupaia/types';

type Answers = DatatrakWebSubmitSurveyRequest.ReqBody['answers'];

export const buildUpsertEntity = async (
  config: SurveyScreenComponentConfig,
  questionId: string,
  answers: Answers,
  countryId: Country['id'],
  findEntityById: (id: string) => Promise<Entity>,
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
      if (typeof fieldValue !== 'string') {
        throw new Error(`parentId must be a string`);
      }
      const entityRecord = await findEntityById(fieldValue);
      entity.parent_id = entityRecord.id;
    } else {
      entity[fieldName as keyof Entity] = fieldValue;
    }
  }

  const isUpdate = await findEntityById(entityId);

  if (isUpdate) {
    return entity;
  }

  const selectedCountry = await findEntityById(countryId);
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
