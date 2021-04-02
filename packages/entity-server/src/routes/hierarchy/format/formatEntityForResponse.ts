/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary, reduceToArrayDictionary } from '@tupaia/utils';
import { EntityType } from '../../../models';
import { EntityServerModelRegistry } from '../../../types';
import {
  HierarchyContext,
  ExtendedEntityFields,
  FlattableEntityFields,
  EntityResponseObject,
} from '../types';
import { extendedFieldFunctions, isExtendedField } from '../extendedFieldFunctions';
import { EntityResponseObjectBuilder } from './EntityResponseObjectBuilder';

export async function formatEntityForResponse(
  ctx: HierarchyContext,
  entity: EntityType,
  fields: (keyof ExtendedEntityFields)[],
): Promise<EntityResponseObject>;
export async function formatEntityForResponse(
  ctx: HierarchyContext,
  entity: EntityType,
  flat: keyof FlattableEntityFields,
): Promise<EntityType[typeof flat]>;
export async function formatEntityForResponse(
  ctx: HierarchyContext,
  entity: EntityType,
  fieldsOrFlat: (keyof ExtendedEntityFields)[] | keyof FlattableEntityFields,
) {
  if (!Array.isArray(fieldsOrFlat)) {
    const flat = fieldsOrFlat;
    return entity[flat];
  }
  const fields = fieldsOrFlat;
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
  ctx: HierarchyContext,
  entities: EntityType[],
  fields: (keyof ExtendedEntityFields)[],
): Promise<EntityResponseObject[]>;
export async function formatEntitiesForResponse(
  models: EntityServerModelRegistry,
  ctx: HierarchyContext,
  entities: EntityType[],
  flat: keyof FlattableEntityFields,
): Promise<EntityType[typeof flat][]>;
export async function formatEntitiesForResponse(
  models: EntityServerModelRegistry,
  ctx: HierarchyContext,
  entities: EntityType[],
  fieldsOrFlat: (keyof ExtendedEntityFields)[] | keyof FlattableEntityFields,
) {
  if (!Array.isArray(fieldsOrFlat)) {
    const flat = fieldsOrFlat;
    return Promise.all(entities.map(entity => formatEntityForResponse(ctx, entity, flat)));
  }

  const fields = fieldsOrFlat;
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
