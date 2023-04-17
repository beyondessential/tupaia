import {
  FlattableHierarchyFieldName,
  FlattenedHierarchy,
  HierarchyFieldName,
  HierarchyFields,
  HierarchyResponseObject,
} from './types';

export function formatHierarchiesForResponse(
  entities: HierarchyFields[],
  field: FlattableHierarchyFieldName,
): FlattenedHierarchy[];
export function formatHierarchiesForResponse(
  entities: HierarchyFields[],
  fields: HierarchyFieldName[],
): HierarchyResponseObject[];
export function formatHierarchiesForResponse(
  entities: HierarchyFields[],
  fieldOrFields: FlattableHierarchyFieldName | HierarchyFieldName[],
): FlattenedHierarchy[] | HierarchyResponseObject[];
export function formatHierarchiesForResponse(
  entities: HierarchyFields[],
  fieldOrFields: FlattableHierarchyFieldName | HierarchyFieldName[],
) {
  if (!Array.isArray(fieldOrFields)) {
    const field = fieldOrFields;
    return entities.map(entity => entity[field]);
  }

  const fields = fieldOrFields;
  return entities.map(entity => Object.fromEntries(fields.map(field => [field, entity[field]])));
}
