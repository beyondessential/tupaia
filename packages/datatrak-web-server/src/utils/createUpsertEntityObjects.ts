/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { DatatrakWebSubmitSurveyRequest as RequestT, Entity, Country } from '@tupaia/types';
import { DatatrakWebServerModelRegistry } from '../types';

type Answers = RequestT.ReqBody['answers'];
type EntityUpsertT = RequestT.EntityUpsert;

const buildEntity = async (
  models: DatatrakWebServerModelRegistry,
  entityObject: EntityUpsertT,
  answers: Answers,
  countryId: Country['id'],
) => {
  const { questionId, config } = entityObject;
  const entityId = answers.find((answer: any) => answer.question_id === questionId)
    ?.body as Entity['id'];
  const entity = { id: entityId } as Entity;
  const fields = config?.entity?.fields || {};

  for (const [fieldName, value] of Object.entries(fields)) {
    // Value is not defined, skip
    if (value === undefined) {
      return;
    }

    const fieldValue =
      typeof value === 'string'
        ? value
        : // @ts-ignore
          answers.find((answer: any) => answer.question_id === value?.questionId)?.body;
    if (fieldName === 'parentId') {
      const entityRecord = await models.entity.findById(fieldValue);
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

export const createUpsertEntityObjects = async (
  models: DatatrakWebServerModelRegistry,
  entitiesUpserted: EntityUpsertT[],
  answers: Answers,
  countryId: Country['id'],
) => {
  const upsertEntities = [];

  for (const entityObject of entitiesUpserted) {
    const entity = await buildEntity(models, entityObject, answers, countryId);
    upsertEntities.push(entity);
  }

  return upsertEntities;
};
