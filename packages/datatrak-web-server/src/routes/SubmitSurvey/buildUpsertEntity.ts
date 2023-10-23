/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { generateId } from '@tupaia/database';
import { ajvValidate, isNotNullish } from '@tupaia/tsutils';
import {
  DatatrakWebSubmitSurveyRequest,
  Entity,
  EntityUpdateSchema,
  EntityUpdate,
  SurveyScreenComponentConfig,
  EntityQuestionConfig,
} from '@tupaia/types';

type Answers = DatatrakWebSubmitSurveyRequest.ReqBody['answers'];
type EntityQuestionConfigFields = Exclude<EntityQuestionConfig['fields'], undefined>;
type UnvalidatedEntity = {
  [K in keyof Entity]?: unknown;
};

const addFieldToEntity = async <T extends keyof EntityQuestionConfigFields>(
  fieldName: T,
  value: EntityQuestionConfigFields[T],
  entity: UnvalidatedEntity,
  answers: Answers,
  findEntityById: (id: string) => Promise<Entity>,
) => {
  if (value === undefined) {
    return;
  }

  const fieldValue = typeof value === 'string' ? value : answers[value.questionId];

  if (!isNotNullish(fieldValue)) {
    return;
  }

  if (fieldName === 'parentId') {
    if (typeof fieldValue !== 'string') {
      throw new Error(`parentId must be a string`);
    }
    const entityRecord = await findEntityById(fieldValue);
    entity.parent_id = entityRecord.id;
    return;
  }

  entity[fieldName as Exclude<T, 'parentId'>] = fieldValue;
};

const buildEntity = async (
  baseEntity: UnvalidatedEntity,
  config: SurveyScreenComponentConfig,
  answers: Answers,
  findEntityById: (id: string) => Promise<Entity>,
) => {
  const fields = config?.entity?.fields || {};
  const newEntity = { ...baseEntity };

  for (const [fieldName, value] of Object.entries(fields)) {
    addFieldToEntity(
      fieldName as keyof EntityQuestionConfigFields,
      value,
      newEntity,
      answers,
      findEntityById,
    );
  }

  return ajvValidate<EntityUpdate>(EntityUpdateSchema, newEntity);
};

export const buildUpsertEntity = async (
  config: SurveyScreenComponentConfig,
  questionId: string,
  answers: Answers,
  countryId: Entity['id'],
  findEntityById: (id: string) => Promise<Entity>,
) => {
  const entityId = answers[questionId] || generateId();
  if (typeof entityId !== 'string') {
    throw new Error(`entityId question must be simple string value`);
  }

  const builtEntity = await buildEntity({ id: entityId }, config, answers, findEntityById);

  const existingEntity = await findEntityById(entityId);
  if (existingEntity) {
    return builtEntity;
  }

  const selectedCountry = await findEntityById(countryId);
  if (!builtEntity.country_code) {
    builtEntity.country_code = selectedCountry.code;
  }
  if (!builtEntity.parent_id) {
    builtEntity.parent_id = selectedCountry.id;
  }
  if (!builtEntity.code) {
    builtEntity.code = entityId;
  }

  return builtEntity;
};
