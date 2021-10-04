/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { QueryConjunctions } from '@tupaia/server-boilerplate';

import { Writable, ObjectLikeKeys, Flatten } from '../../../types';
import { EntityFilter, EntityFields } from '../../../models';

const CLAUSE_DELIMITER = ';';
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
type NotNull<T> = T extends Array<infer U> ? Array<Exclude<U, null>> : Exclude<T, null>;
type NotNullValues<T> = {
  [field in keyof T]: NotNull<T[field]>;
};

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

type JsonBKey<T extends keyof NestedFilterQueryFields> =
  T extends `${infer Field}${typeof NESTED_FIELD_DELIMITER}${infer Key}`
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
};
type Operator = keyof typeof operatorToSqlComparator;

const filterOperators = Object.keys(operatorToSqlComparator) as Operator[];

const formatComparisonValue = (value: string | string[], operator: Operator) => {
  if (operator === '=@' && typeof value === 'string') {
    return `%${value}%`;
  }

  return value;
};

const convertValueToAdvancedCriteria = (operator: Operator, value: string | string[]) => {
  // For equal operator, we do not need to specify comparison object.
  if (operator === '==') {
    return value;
  }

  const comparator = operatorToSqlComparator[operator];

  return {
    comparator,
    comparisonValue: formatComparisonValue(value, operator),
  };
};

const toFilterClause = (queryClause: string) => {
  const operator = filterOperators.find(o => queryClause.includes(o));

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

  const formattedField = isNestedField(field) ? toJsonBKey(field) : field;

  return [formattedField, operator, value] as [
    typeof formattedField,
    typeof operator,
    typeof value,
  ];
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
  const filter: Writable<NotNullValues<EntityFilter>> = {};

  filterClauses.forEach(([field, operator, value]) => {
    const parsedValue = value.includes(MULTIPLE_VALUES_DELIMITER)
      ? value.split(MULTIPLE_VALUES_DELIMITER)
      : value;

    filter[field] = convertValueToAdvancedCriteria(operator, parsedValue);
  });

  // To always force returning only entities in allowed countries, even if there is country_code filter in the query params.
  filter[QueryConjunctions.AND] = {
    country_code: allowedCountries,
  };

  return filter;
};
