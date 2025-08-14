import { Entity } from '@tupaia/types';
import { ExtendedEntityFieldName, FlattableEntityFieldName } from '../types';
import { extendedFieldFunctions } from '../extendedFieldFunctions';
import { extractFieldFromQuery, extractFieldsFromQuery } from '../../utils/fields';

const flattableFields: FlattableEntityFieldName[] = ['id', 'code', 'name'];

export const extractEntityFieldFromQuery = (queryField?: string) =>
  extractFieldFromQuery(queryField, flattableFields);

const validFields: (keyof Entity)[] = [
  'id',
  'code',
  'country_code',
  'name',
  'image_url',
  'type',
  'attributes',
];

const allFields = [
  ...validFields,
  ...Object.keys(extendedFieldFunctions),
] as ExtendedEntityFieldName[];

export const extractEntityFieldsFromQuery = (queryFields?: string) =>
  extractFieldsFromQuery(queryFields, allFields);
