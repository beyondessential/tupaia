/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary, reduceToArrayDictionary } from '@tupaia/utils';
import { EntityType, EntityFields, AncestorDescendantRelationType } from '../../../models';
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

const buildRelationRecordsAndEntityIdToCodeMap = async (
  req: HierarchyRequest,
  fields: (keyof ExtendedEntityFields)[],
  entities: EntityType[],
  context: HierarchyContext,
): Promise<[AncestorDescendantRelationType[], Record<string, string>]> => {
  if (!fields.includes('parent_code') && !fields.includes('children_codes')) {
    return [[], {}];
  }
  const relationRecords = await req.models.ancestorDescendantRelation.find({
    entity_hierarchy_id: context.hierarchyId,
    generational_distance: 1,
  });
  const entityIdToCodeMap = reduceToDictionary(entities, 'id', 'code');
  return [relationRecords, entityIdToCodeMap];
};

export const mapEntitiesToFields = (
  req: HierarchyRequest,
  fields: (keyof ExtendedEntityFields)[],
) => async (entities: EntityType[], context: HierarchyContext) => {
  const [relationRecords, entityIdToCodeMap] = await buildRelationRecordsAndEntityIdToCodeMap(
    req,
    fields,
    entities,
    context,
  );
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
            'descendant_id',
            'ancestor_id',
          );
          entities.forEach((entity, index) => {
            mappedEntities[index].parent_code = getParentCodeBulk(
              entity,
              entityIdToCodeMap,
              childToParentMap,
            );
          });
          break;
        }
        case 'children_codes': {
          const parentToChildrenMap = reduceToArrayDictionary(
            relationRecords,
            'ancestor_id',
            'descendant_id',
          );
          entities.forEach((entity, index) => {
            mappedEntities[index].children_codes = getChildrenCodesBulk(
              entity,
              entityIdToCodeMap,
              parentToChildrenMap,
            );
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
