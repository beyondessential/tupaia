/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Writable, ObjectLikeKeys, Flatten } from '../../../types';
import { EntityFilter, EntityFields } from '../../../models';

const CLAUSE_DELIMITER = ';';
const FIELD_VALUE_DELIMITER = ':';
const NESTED_FIELD_DELIMITER = '_';
const JSONB_FIELD_DELIMITER = '->>';
const MULTIPLE_VALUES_DELIMITER = ',';

type NestedFilterQueryFields = Flatten<
  Pick<EntityFields, ObjectLikeKeys<EntityFields>>,
  typeof NESTED_FIELD_DELIMITER
>;

type EntityFilterQuery = Partial<
  Omit<EntityFields, ObjectLikeKeys<EntityFields>> & NestedFilterQueryFields
>;

const filterableFields: (keyof EntityFilterQuery)[] = [
  'id',
  'code',
  'country_code',
  'name',
  'image_url',
  'type',
  'attributes_type',
];
const isFilterableField = (field: string): field is keyof EntityFilterQuery =>
  (filterableFields as string[]).includes(field);

const nestedFields: (keyof NestedFilterQueryFields)[] = ['attributes_type'];
const isNestedField = (field: keyof EntityFilterQuery): field is keyof NestedFilterQueryFields =>
  (nestedFields as (keyof EntityFilterQuery)[]).includes(field);

type JsonBKey<
  T extends keyof NestedFilterQueryFields
> = T extends `${infer Field}${typeof NESTED_FIELD_DELIMITER}${infer Key}`
  ? `${Field}${typeof JSONB_FIELD_DELIMITER}${Key}`
  : T;

const toJsonBKey = <T extends keyof NestedFilterQueryFields>(nestedField: T): JsonBKey<T> => {
  const [field, value] = nestedField.split(NESTED_FIELD_DELIMITER);
  return [field, value].join(JSONB_FIELD_DELIMITER) as JsonBKey<T>;
};

const toFilterClause = (queryClause: string) => {
  const clauseParts = queryClause.split(FIELD_VALUE_DELIMITER);
  if (clauseParts.length !== 2) {
    throw new Error(`Filter clause must be of format: <field>${FIELD_VALUE_DELIMITER}<value>`);
  }

  const [field, value] = clauseParts;
  if (!isFilterableField(field)) {
    throw new Error(`Unknown filter key: ${field}, must be one of: ${filterableFields}`);
  }

  const formattedField = isNestedField(field) ? toJsonBKey(field) : field;
  return [formattedField, value] as [typeof formattedField, typeof value];
};

export const extractFilterFromQuery = (queryFilter?: string) => {
  if (!queryFilter) {
    return {};
  }

  const filterClauses = queryFilter.split(CLAUSE_DELIMITER).map(toFilterClause);
  const filter: Writable<EntityFilter> = {};

  filterClauses.forEach(([field, value]) => {
    const parsedValue = value.includes(MULTIPLE_VALUES_DELIMITER)
      ? value.split(MULTIPLE_VALUES_DELIMITER)
      : value;
    filter[field] = parsedValue;
  });

  return filter as EntityFilter;
};
