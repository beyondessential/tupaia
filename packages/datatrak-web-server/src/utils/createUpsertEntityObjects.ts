/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry } from '@tupaia/database';
import { DatatrakWebSubmitSurveyRequest as RequestT, Entity } from '@tupaia/types';

export interface DatatrakModelRegistry extends ModelRegistry {
  readonly entity: any;
}

type SurveyAnswers = Record<string, any>;

const buildEntity = async (
  models: DatatrakModelRegistry,
  entityObject: RequestT.EntityUpsert,
  answers: SurveyAnswers,
) => {
  const { questionId, config } = entityObject;
  const entityId = answers[questionId];
  const entity = { id: entityId } as Entity;

  for (const [fieldName, value] of Object.entries(config.entity.fields)) {
    // Value is not defined, skip
    if (value === undefined) {
      return;
    }

    const fieldValue = typeof value === 'string' ? value : answers[value.questionId];
    if (fieldName === 'parentId') {
      const entityRecord = await models.entity.findById(fieldValue);
      entity.parent_id = entityRecord.id;
    } else {
      entity[fieldName as keyof Entity] = fieldValue;
    }
  }

  const isUpdate = await models.entity.findById('Entity', entityId);

  if (isUpdate) {
    return entity;
  }

  // const selectedCountry = () => models.country.findById(selectedCountryId);
  // if (!entity.countryCode) {
  //   entity.countryCode = selectedCountry.code;
  // }
  // if (!entity.parent_id) {
  //   entity.parent_id = selectedCountry.entity.id;
  // }
  // if (!entity.code) {
  //   entity.code = entityId;
  // }

  return entity;
};

export const createUpsertEntityObjects = async (
  models: DatatrakModelRegistry,
  entitiesUpserted: RequestT.EntityUpsert[],
  answers: RequestT.Answers,
) => {
  const upsertEntities = [];

  for (const entityObject of entitiesUpserted) {
    const entity = await buildEntity(models, entityObject, answers);
    upsertEntities.push(entity);
  }

  return upsertEntities;
};
