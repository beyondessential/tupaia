import { EntityType } from '../../models';
import {
  FlattableHierarchyFieldName,
  FlattenedHierarchy,
  HierarchyFieldName,
  HierarchyResponseObject,
} from './types';

export function formatEntitiesForResponse(
  entities: EntityType[],
  field: FlattableHierarchyFieldName,
): FlattenedHierarchy[];
export function formatEntitiesForResponse(
  entities: EntityType[],
  fields: HierarchyFieldName[],
): HierarchyResponseObject[];
export function formatEntitiesForResponse(
  entities: EntityType[],
  fieldOrFields: FlattableHierarchyFieldName | HierarchyFieldName[],
): FlattenedHierarchy[] | HierarchyResponseObject[];
export function formatEntitiesForResponse(
  entities: EntityType[],
  fieldOrFields: FlattableHierarchyFieldName | HierarchyFieldName[],
) {
  if (!Array.isArray(fieldOrFields)) {
    const field = fieldOrFields;
    return entities.map(entity => entity[field]);
  }

  const fields = fieldOrFields;
  return entities.map(entity => Object.fromEntries(fields.map(field => [field, entity[field]])));
}
