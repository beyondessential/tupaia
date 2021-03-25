/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary, reduceToArrayDictionary } from '@tupaia/utils';
import { EntityType, EntityFields } from '../../../models';
import { HierarchyRequest, HierarchyContext, ExtendedEntityFields } from '../types';
import { extendedFieldFunctions } from '../extendedFieldFunctions';
import { EntityResponseObjectBuilder } from './EntityResponseObjectBuilder';

const validFields: (keyof EntityFields)[] = ['code', 'country_code'];
const isEntityField = (field: string): field is keyof EntityFields =>
  (validFields as string[]).includes(field);
const isExtendedField = (field: string): field is keyof typeof extendedFieldFunctions =>
  Object.keys(extendedFieldFunctions).includes(field);
const validateField = (field: string): field is keyof ExtendedEntityFields =>
  isEntityField(field) || isExtendedField(field);

const allFields = [
  ...validFields,
  ...Object.keys(extendedFieldFunctions),
] as (keyof ExtendedEntityFields)[];

export const extractFieldsFromQuery = (queryFields?: string) => {
  if (!queryFields) {
    return allFields; // Display all fields if none specifically requested
  }

  const requestedFields = queryFields.split(',');
  const fields = new Set<keyof ExtendedEntityFields>();
  requestedFields.forEach(requestedField => {
    if (validateField(requestedField)) {
      fields.add(requestedField);
    } else {
      throw new Error(`Unknown field requested: ${requestedField}`);
    }
  });
  return Array.from(fields);
};

export const mapEntityToFields = (fields: (keyof ExtendedEntityFields)[]) => async (
  entity: EntityType,
  context: HierarchyContext,
) => {
  const responseBuilder = new EntityResponseObjectBuilder();
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (isExtendedField(field)) {
      responseBuilder.set(field, await extendedFieldFunctions[field](entity, context));
    } else {
      responseBuilder.set(field, entity[field]);
    }
  }
  return responseBuilder.build();
};

export const mapEntitiesToFields = (
  req: HierarchyRequest,
  fields: (keyof ExtendedEntityFields)[],
) => async (entities: EntityType[], context: HierarchyContext) => {
  const relationRecords =
    fields.includes('parent_code') || fields.includes('child_codes')
      ? await req.models.ancestorDescendantRelation.getImmediateRelations(context.hierarchyId, {
          'descendant.country_code': req.context.allowedCountries,
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
              responseBuilders[index].set(
                field,
                await extendedFieldFunctions[field](entity, context),
              );
            }),
          );
        }
      }
    } else {
      entities.forEach((entity, index) => responseBuilders[index].set(field, entity[field]));
    }
  }
  return responseBuilders.map(builder => builder.build());
};
