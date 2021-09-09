/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityFields } from '../../../models';
import { ExtendedEntityFieldName, FlattableEntityFieldName } from '../types';
import { extendedFieldFunctions, isExtendedField } from '../extendedFieldFunctions';

const flattableFields: FlattableEntityFieldName[] = ['id', 'code', 'name'];
const isFlattableField = (field: string): field is FlattableEntityFieldName =>
  (flattableFields as string[]).includes(field);

export const extractFieldFromQuery = (queryField?: string) => {
  if (!queryField) {
    return undefined;
  }

  if (isFlattableField(queryField)) {
    return queryField;
  }

  throw new Error(
    `Invalid single field requested ${queryField}, must be one of: ${flattableFields}`,
  );
};

const validFields: (keyof EntityFields)[] = [
  'id',
  'code',
  'country_code',
  'name',
  'image_url',
  'type',
  'attributes',
];
const isEntityField = (field: string): field is keyof EntityFields =>
  (validFields as string[]).includes(field);
const validateField = (field: string): field is ExtendedEntityFieldName =>
  isEntityField(field) || isExtendedField(field);

const allFields = [
  ...validFields,
  ...Object.keys(extendedFieldFunctions),
] as ExtendedEntityFieldName[];

export const extractFieldsFromQuery = (queryFields?: string) => {
  if (!queryFields) {
    return allFields; // Display all fields if none specifically requested
  }

  const requestedFields = queryFields.split(',');
  const fields = new Set<ExtendedEntityFieldName>();
  requestedFields.forEach(requestedField => {
    if (validateField(requestedField)) {
      fields.add(requestedField);
    } else {
      throw new Error(`Unknown field requested: ${requestedField}, must be one of: ${validFields}`);
    }
  });
  return Array.from(fields);
};
