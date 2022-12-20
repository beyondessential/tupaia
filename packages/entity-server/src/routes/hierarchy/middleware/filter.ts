/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { QueryConjunctions } from '@tupaia/server-boilerplate';
import { getSortByKey } from '@tupaia/utils';

import { Writable, NumericKeys, ObjectLikeKeys, Flatten } from '../../../types';
import { EntityFilter, EntityQueryFields } from '../../../models';

const CLAUSE_DELIMITER = ';';
const NESTED_FIELD_DELIMITER = '_';
const JSONB_FIELD_DELIMITER = '->>';
const MULTIPLE_VALUES_DELIMITER = ',';

type NestedFilterQueryFields = Flatten<
  Pick<EntityQueryFields, ObjectLikeKeys<EntityQueryFields>>,
  typeof NESTED_FIELD_DELIMITER
>;

type NumericFilterQueryFields = Pick<EntityQueryFields, NumericKeys<EntityQueryFields>>;

type EntityFilterQuery = Partial<
  Omit<EntityQueryFields, ObjectLikeKeys<EntityQueryFields>> & NestedFilterQueryFields
>;
type NotNull<T> = T extends Array<infer U> ? Array<Exclude<U, null>> : Exclude<T, null>;
type NotNullValues<T> = {
  [field in keyof T]: NotNull<T[field]>;
};

type ExtractArrays<T> = T extends unknown[] ? T : never;

const filterableFields: (keyof EntityFilterQuery)[] = [
  'id',
  'code',
  'country_code',
  'name',
  'image_url',
  'type',
  'attributes_type',
  'generational_distance',
];
const isFilterableField = (field: string): field is keyof EntityFilterQuery =>
  (filterableFields as string[]).includes(field);

const nestedFields: (keyof NestedFilterQueryFields)[] = ['attributes_type'];
const isNestedField = (field: keyof EntityFilterQuery): field is keyof NestedFilterQueryFields =>
  (nestedFields as (keyof EntityFilterQuery)[]).includes(field);

const numericFields: (keyof NumericFilterQueryFields)[] = ['generational_distance'];
const isNumericField = (field: keyof EntityFilterQuery): field is keyof NumericFilterQueryFields =>
  (numericFields as (keyof EntityFilterQuery)[]).includes(field);

type JsonBKey<
  T extends keyof NestedFilterQueryFields
> = T extends `${infer Field}${typeof NESTED_FIELD_DELIMITER}${infer Key}`
  ? `${Field}${typeof JSONB_FIELD_DELIMITER}${Key}`
  : T;

const toJsonBKey = <T extends keyof NestedFilterQueryFields>(nestedField: T): JsonBKey<T> => {
  const [field, value] = nestedField.split(NESTED_FIELD_DELIMITER);
  return [field, value].join(JSONB_FIELD_DELIMITER) as JsonBKey<T>;
};

// Inspired by Google Analytics filter: https://developers.google.com/analytics/devguides/reporting/core/v3/reference?hl=en#filters
const operatorToSqlComparator = {
  '==': '=' as const, // Exact match
  '!=': '!=' as const, // Does not match
  '=@': 'ilike' as const, // Contains sub string
  '<': '<' as const, // Less than
  '<=': '<=' as const, // Less than or equal
  '>': '>' as const, // Greater than
  '>=': '>=' as const, // Greater than or equal
};
type Operator = keyof typeof operatorToSqlComparator;

const filterOperators = Object.keys(operatorToSqlComparator) as Operator[];

type Value = string | string[] | number | number[];

const formatComparisonValue = (value: Value, operator: Operator) => {
  if (operator === '=@' && typeof value === 'string') {
    return `%${value}%`;
  }

  return value;
};

const formatValue = <T extends keyof EntityFilterQuery>(field: T, value: string) =>
  isNumericField(field) ? parseFloat(value) : value;

const convertValueToAdvancedCriteria = (
  field: keyof EntityFilterQuery,
  operator: Operator,
  value: string,
) => {
  const formattedValue = value.includes(MULTIPLE_VALUES_DELIMITER)
    ? (value
        .split(MULTIPLE_VALUES_DELIMITER)
        .map(val => formatValue(field, val)) as ExtractArrays<Value>)
    : formatValue(field, value);

  // For equal operator, we do not need to specify comparison object.
  if (operator === '==') {
    return formattedValue;
  }

  const comparator = operatorToSqlComparator[operator];

  return {
    comparator,
    comparisonValue: formatComparisonValue(formattedValue, operator),
  };
};

const toFilterClause = (queryClause: string) => {
  const [operator] = filterOperators
    .filter(o => queryClause.includes(o))
    .sort(getSortByKey('length', { ascending: false }));

  if (!operator) {
    throw new Error(
      `Invalid query clause: '${queryClause}'. Cannot find valid operator. Available operators are: ${filterOperators.toString()}`,
    );
  }

  const clauseParts = queryClause.split(operator);
  if (clauseParts.length !== 2) {
    throw new Error(
      `Invalid query clause: '${queryClause}'. Filter clause must be of format: <field><operator><value>`,
    );
  }

  const [field, value] = clauseParts;
  if (!isFilterableField(field)) {
    throw new Error(`Unknown filter key: ${field}, must be one of: ${filterableFields}`);
  }

  return [field, operator, value] as [typeof field, typeof operator, typeof value];
};

export const extractFilterFromQuery = (
  allowedCountries: string[],
  queryFilter?: string,
): EntityFilter => {
  if (!queryFilter) {
    // default filter to only get entities in allowed countries.
    return {
      [QueryConjunctions.AND]: {
        country_code: allowedCountries,
      },
    };
  }

  const filterClauses = queryFilter.split(CLAUSE_DELIMITER).map(toFilterClause);
  const filter: Writable<NotNullValues<Record<string, unknown>>> = {};

  filterClauses.forEach(([field, operator, value]) => {
    const formattedField = isNestedField(field) ? toJsonBKey(field) : field;
    filter[formattedField] = convertValueToAdvancedCriteria(field, operator, value);
  });

  // To always force returning only entities in allowed countries, even if there is country_code filter in the query params.
  filter[QueryConjunctions.AND] = {
    country_code: allowedCountries,
  };

  return filter;
};
