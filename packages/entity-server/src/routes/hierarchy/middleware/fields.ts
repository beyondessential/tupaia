/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary, reduceToArrayDictionary } from '@tupaia/utils';
import { EntityType, EntityFields } from '../../../models';
import { Resolved } from '../../../types';
import {
  HierarchyRequest,
  HierarchyContext,
  ExtendedEntityFields,
  EntityResponseObject,
} from '../types';
import {
  extendedFieldFunctions,
  getParentCodeBulk,
  getChildrenCodesBulk,
} from '../extendedFieldFunctions';

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

type Writable<T> = { -readonly [field in keyof T]?: T[field] };

const assignExtendedFieldToResponseObject = async (
  entity: EntityType,
  responseObject: Writable<EntityResponseObject>,
  field: keyof typeof extendedFieldFunctions,
  context: HierarchyContext,
) => {
  /* eslint-disable no-param-reassign */
  (responseObject[field] as Resolved<
    ReturnType<typeof extendedFieldFunctions[typeof field]>
  >) = await extendedFieldFunctions[field](entity, context);
  /* eslint-enable no-param-reassign */
};

const assignBasicFieldToResponseObject = async (
  entity: EntityType,
  responseObject: Writable<EntityResponseObject>,
  field: keyof EntityFields,
) => {
  /* eslint-disable no-param-reassign */
  (responseObject[field] as typeof entity[typeof field]) = entity[field];
  /* eslint-enable no-param-reassign */
};

export const mapEntityToFields = (fields: (keyof ExtendedEntityFields)[]) => async (
  entity: EntityType,
  context: HierarchyContext,
) => {
  const mappedEntity: Writable<EntityResponseObject> = {};
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (isExtendedField(field)) {
      await assignExtendedFieldToResponseObject(entity, mappedEntity, field, context);
    } else {
      assignBasicFieldToResponseObject(entity, mappedEntity, field);
    }
  }
  return mappedEntity;
};

export const mapEntitiesToFields = (
  req: HierarchyRequest,
  fields: (keyof ExtendedEntityFields)[],
) => async (entities: EntityType[], context: HierarchyContext) => {
  const relationRecords =
    fields.includes('parent_code') || fields.includes('children_codes')
      ? await req.models.ancestorDescendantRelation.getImmediateRelations(context.hierarchyId, {
          'descendant.country_code': req.context.allowedCountries,
        })
      : [];
  const mappedEntities: Writable<EntityResponseObject>[] = new Array(entities.length)
    .fill(0)
    .map(() => ({})); // fill array with empty objects
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
          entities.forEach((entity, index) => {
            mappedEntities[index].parent_code = getParentCodeBulk(entity, childToParentMap);
          });
          break;
        }
        case 'children_codes': {
          const parentToChildrenMap = reduceToArrayDictionary(
            relationRecords,
            'ancestor_code',
            'descendant_code',
          );
          entities.forEach((entity, index) => {
            mappedEntities[index].children_codes = getChildrenCodesBulk(
              entity,
              parentToChildrenMap,
            );
          });
          break;
        }
        default: {
          await Promise.all(
            entities.map((entity, index) => {
              return assignExtendedFieldToResponseObject(
                entity,
                mappedEntities[index],
                field,
                context,
              );
            }),
          );
        }
      }
    } else {
      entities.forEach((entity, index) => {
        assignBasicFieldToResponseObject(entity, mappedEntities[index], field);
      });
    }
  }
  return mappedEntities;
};
