/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary, reduceToArrayDictionary } from '@tupaia/utils';
import { EntityType, EntityFields } from '../../../models';
import {
  HierarchyRequest,
  HierarchyContext,
  ExtendedEntityFields,
  EntityResponseObject,
} from '../types';
import { extendedFieldFunctions } from '../extendedFieldFunctions';

const validFields: (keyof EntityFields)[] = ['code', 'country_code'];
const isEntityField = (field: string): field is keyof EntityFields =>
  (validFields as string[]).includes(field);
const validateField = (field: string): field is keyof ExtendedEntityFields =>
  isEntityField(field) || Object.keys(extendedFieldFunctions).includes(field);

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

type Writable<T> = { -readonly [field in keyof T]?: T[field] };
export const mapEntityToFields = (fields: (keyof ExtendedEntityFields)[]) => async (
  entity: EntityType,
  context: HierarchyContext,
) => {
  const mappedEntity: Writable<EntityResponseObject> = {};
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (isEntityField(field)) {
      mappedEntity[field] = entity[field];
    } else {
      (mappedEntity[field] as string | string[] | undefined) = await extendedFieldFunctions[field](
        entity,
        context,
      );
    }
  }
  return mappedEntity;
};

export const mapEntitiesToFields = (
  req: HierarchyRequest,
  fields: (keyof ExtendedEntityFields)[],
) => async (entities: EntityType[], context: HierarchyContext) => {
  const relationRecords =
    fields.includes('parent_code') || fields.includes('child_codes')
      ? await req.models.ancestorDescendantRelation.getImmediateRelations(context.hierarchyId)
      : [];
  const mappedEntities: Writable<EntityResponseObject>[] = new Array(entities.length)
    .fill(0)
    .map(() => ({})); // fill array with empty objects
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (isEntityField(field)) {
      entities.forEach((entity, index) => {
        mappedEntities[index][field] = entity[field];
      });
    } else {
      switch (field) {
        case 'parent_code': {
          const childToParentMap = reduceToDictionary(
            relationRecords,
            'descendant_code',
            'ancestor_code',
          );
          entities.forEach((entity, index) => {
            mappedEntities[index].parent_code = childToParentMap[entity.code];
          });
          break;
        }
        case 'child_codes': {
          const parentToChildrenMap = reduceToArrayDictionary(
            relationRecords,
            'ancestor_code',
            'descendant_code',
          );
          entities.forEach((entity, index) => {
            mappedEntities[index].child_codes = parentToChildrenMap[entity.code];
          });
          break;
        }
        default: {
          throw new Error(`Unknown extended entity field requested: ${field}`);
        }
      }
    }
  }
  return mappedEntities;
};
