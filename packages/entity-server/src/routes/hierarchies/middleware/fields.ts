/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { extractFieldFromQuery, extractFieldsFromQuery } from '../../utils';
import { FlattableHierarchyFieldName, HierarchyFields } from '../types';

const flattableFields: FlattableHierarchyFieldName[] = ['id', 'code', 'name'];

export const extractHierarchyFieldFromQuery = (queryField?: string) =>
  extractFieldFromQuery(queryField, flattableFields);

const allFields: (keyof HierarchyFields)[] = ['id', 'code', 'name', 'attributes'];

export const extractHierarchyFieldsFromQuery = (queryFields?: string) =>
  extractFieldsFromQuery(queryFields, allFields);
