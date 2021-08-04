/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary, reduceToArrayDictionary } from '@tupaia/utils';
import { EntityType } from '../../../models';
import { EntityServerModelRegistry } from '../../../types';
import {
  ExtendedEntityFieldName,
  FlattableEntityFieldName,
  EntityResponseObject,
  FlattenedEntity,
} from '../types';
import { extendedFieldFunctions, isExtendedField } from '../extendedFieldFunctions';
import { EntityResponseObjectBuilder } from './EntityResponseObjectBuilder';

type FormatContext = { hierarchyId: string; allowedCountries: string[] };

export async function formatEntityForResponse(
  ctx: FormatContext,
  entity: EntityType,
  field: FlattableEntityFieldName,
): Promise<FlattenedEntity>;
export async function formatEntityForResponse(
  ctx: FormatContext,
  entity: EntityType,
  fields: ExtendedEntityFieldName[],
): Promise<EntityResponseObject>;
export async function formatEntityForResponse(
  ctx: FormatContext,
  entity: EntityType,
  fieldOrFields: FlattableEntityFieldName | ExtendedEntityFieldName[],
): Promise<FlattenedEntity | EntityResponseObject>;
export async function formatEntityForResponse(
  ctx: FormatContext,
  entity: EntityType,
  fieldOrFields: FlattableEntityFieldName | ExtendedEntityFieldName[],
) {
  if (!Array.isArray(fieldOrFields)) {
    const field = fieldOrFields;
    return entity[field];
  }
  const fields = fieldOrFields;
  const responseBuilder = new EntityResponseObjectBuilder();
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (isExtendedField(field)) {
      responseBuilder.set(field, await extendedFieldFunctions[field](entity, ctx));
    } else {
      responseBuilder.set(field, entity[field]);
    }
  }
  return responseBuilder.build();
}

export async function formatEntitiesForResponse(
  models: EntityServerModelRegistry,
  ctx: FormatContext,
  entities: EntityType[],
  field: FlattableEntityFieldName,
): Promise<FlattenedEntity[]>;
export async function formatEntitiesForResponse(
  models: EntityServerModelRegistry,
  ctx: FormatContext,
  entities: EntityType[],
  fields: ExtendedEntityFieldName[],
): Promise<EntityResponseObject[]>;
export async function formatEntitiesForResponse(
  models: EntityServerModelRegistry,
  ctx: FormatContext,
  entities: EntityType[],
  fieldOrFields: FlattableEntityFieldName | ExtendedEntityFieldName[],
): Promise<FlattenedEntity[] | EntityResponseObject[]>;
export async function formatEntitiesForResponse(
  models: EntityServerModelRegistry,
  ctx: FormatContext,
  entities: EntityType[],
  fieldOrFields: FlattableEntityFieldName | ExtendedEntityFieldName[],
) {
  if (!Array.isArray(fieldOrFields)) {
    const field = fieldOrFields;
    return Promise.all(entities.map(entity => formatEntityForResponse(ctx, entity, field)));
  }

  const fields = fieldOrFields;
  const { hierarchyId } = ctx;
  const relationRecords =
    fields.includes('parent_code') || fields.includes('child_codes')
      ? await models.ancestorDescendantRelation.getImmediateRelations(hierarchyId, {
          'descendant.country_code': ctx.allowedCountries,
        })
      : [];
  const responseBuilders: EntityResponseObjectBuilder[] = new Array(entities.length)
    .fill(0)
    .map(() => new EntityResponseObjectBuilder()); // fill array with empty objects
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (isExtendedField(field)) {
      switch (field) {
        case 'parent_code': {
          const childToParentMap = reduceToDictionary(
            relationRecords,
            'descendant_code',
            'ancestor_code',
          );
          entities.forEach((entity, index) =>
            responseBuilders[index].set('parent_code', childToParentMap[entity.code]),
          );
          break;
        }
        case 'child_codes': {
          const parentToChildrenMap = reduceToArrayDictionary(
            relationRecords,
            'ancestor_code',
            'descendant_code',
          );
          entities.forEach((entity, index) =>
            responseBuilders[index].set('child_codes', parentToChildrenMap[entity.code]),
          );
          break;
        }
        default: {
          await Promise.all(
            entities.map(async (entity, index) => {
              responseBuilders[index].set(field, await extendedFieldFunctions[field](entity, ctx));
            }),
          );
        }
      }
    } else {
      entities.forEach((entity, index) => responseBuilders[index].set(field, entity[field]));
    }
  }
  return responseBuilders.map(builder => builder.build());
}
