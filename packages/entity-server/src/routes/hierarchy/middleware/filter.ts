import { QueryConjunctions, EntityFilter, EntityFilterFields } from '@tupaia/server-boilerplate';
import { NumericKeys, Writable } from '@tupaia/types';
import { getSortByKey } from '@tupaia/utils';

const CLAUSE_DELIMITER = ';';
const JSONB_FIELD_DELIMITER = '->>';
const MULTIPLE_VALUES_DELIMITER = ',';

type NumericFilterQueryFields = Pick<EntityFilterFields, NumericKeys<Required<EntityFilterFields>>>;

type EntityFilterQuery = Partial<EntityFilterFields>;
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
  'generational_distance',
  'attributes',
];
const isFilterableField = (field: string): field is keyof EntityFilterQuery =>
  (filterableFields as string[]).includes(field);

const numericFields: (keyof NumericFilterQueryFields)[] = ['generational_distance'];
const isNumericField = (field: keyof EntityFilterQuery): field is keyof NumericFilterQueryFields =>
  (numericFields as (keyof EntityFilterQuery)[]).includes(field);

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
const operatorToSqlArrayComparator = {
  '==': 'IN' as const, // Contained in array
  '!=': 'NOT IN' as const, // Not contained in array
  '=@': undefined, // '@>' might be nice here, but none of our filterable fields are arrays
  '<': undefined,
  '<=': undefined,
  '>': undefined,
  '>=': undefined,
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

  const comparisonValue = formatComparisonValue(formattedValue, operator);

  if (Array.isArray(formattedValue)) {
    const arrayComparator = operatorToSqlArrayComparator[operator];
    if (!arrayComparator) {
      throw new Error(`Operator ${operator} is not compatible with multiple filter values`);
    }
    return {
      comparator: arrayComparator,
      comparisonValue,
    };
  }

  return {
    comparator: operatorToSqlComparator[operator],
    comparisonValue,
  };
};

const toFilterClause = (queryClause: string) => {
  const [operator] = filterOperators
    .filter(o => queryClause.includes(o))
    // Keep the longest matching operator, e.g. >= instead of >
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
  let firstField = field;

  // if the field is already in the form of a JSONB key, we just need to check the the first field is valid
  if (field.includes(JSONB_FIELD_DELIMITER)) {
    firstField = field.split(JSONB_FIELD_DELIMITER)[0];
  }
  if (!isFilterableField(firstField)) {
    throw new Error(`Unknown filter key: ${firstField}, must be one of: ${filterableFields}`);
  }

  // return the field as passed in, because if it has a JSONB key, we want to keep it
  return [field, operator, value] as [typeof firstField, typeof operator, typeof value];
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
        [QueryConjunctions.OR]: {
          country_code: null,
        },
      },
    };
  }

  const filterClauses = queryFilter.split(CLAUSE_DELIMITER).map(toFilterClause);
  //TODO: Stop using any here in favour of validating against the entity filter schema
  const filter: Writable<NotNullValues<Record<string, any>>> = {};

  filterClauses.forEach(([field, operator, value]) => {
    filter[field] = convertValueToAdvancedCriteria(field, operator, value);
  });

  // To always force returning only entities in allowed countries, even if there is country_code filter in the query params.
  filter[QueryConjunctions.AND] = {
    country_code: allowedCountries,
    [QueryConjunctions.OR]: {
      country_code: null,
    },
  };

  return filter;
};
