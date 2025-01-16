import { extractFieldFromQuery, extractFieldsFromQuery } from '../../utils';
import { FlattableHierarchyFieldName, HierarchyFields } from '../types';

const flattableFields: FlattableHierarchyFieldName[] = ['id', 'code', 'name'];

const allFields: (keyof HierarchyFields)[] = flattableFields;

export const extractHierarchyFieldFromQuery = (queryField?: string) =>
  extractFieldFromQuery(queryField, flattableFields);

export const extractHierarchyFieldsFromQuery = (queryFields?: string) =>
  extractFieldsFromQuery(queryFields, allFields);
