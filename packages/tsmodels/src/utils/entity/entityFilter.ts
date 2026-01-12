import { Country, NumericKeys, Writable } from '@tupaia/types';
import {
  AdvancedFilterValue,
  EntityFilter,
  EntityFilterFields,
  QueryConjunctions,
} from '../../models';

const CLAUSE_DELIMITER = ';';
const JSONB_FIELD_DELIMITER = '->>';
const MULTIPLE_VALUES_DELIMITER = ',';

type NumericFilterQueryFields = Pick<EntityFilterFields, NumericKeys<Required<EntityFilterFields>>>;
type FilterableField = keyof EntityFilterFields;

type NotNull<T> = T extends Array<infer U> ? Array<Exclude<U, null>> : Exclude<T, null>;
type NotNullValues<T> = {
  [field in keyof T]: NotNull<T[field]>;
};

type ExtractArrays<T> = T extends unknown[] ? T : never;

type RawValue = string | number;

type QueryObject = Record<string, AdvancedFilterValue<RawValue>> | undefined | null;

const getDefaultFilter = (allowedCountries: Country['code'][]) => ({
  [QueryConjunctions.AND]: {
    country_code: allowedCountries,
    [QueryConjunctions.OR]: {
      country_code: null,
    },
  },
});

const filterableFields = new Set<FilterableField>([
  'attributes',
  'code',
  'country_code',
  'generational_distance',
  'id',
  'image_url',
  'name',
  'type',
]);
const isFilterableField = (field: string): field is FilterableField =>
  (filterableFields as Set<string>).has(field);

const assertFilterableField = (field: string): FilterableField => {
  let firstField = field;

  // if the field is already in the form of a JSONB key, we just need to check the the first field is valid
  if (field.includes(JSONB_FIELD_DELIMITER)) {
    firstField = field.split(JSONB_FIELD_DELIMITER)[0];
  }
  if (!isFilterableField(firstField)) {
    throw new Error(
      `Unknown filter key ‘${firstField}’. Must be one of: ${Array.from(filterableFields).join(', ')}`,
    );
  }

  return firstField;
};

const numericFields = new Set<keyof NumericFilterQueryFields>(['generational_distance']);
const isNumericField = (field: FilterableField): field is keyof NumericFilterQueryFields =>
  (numericFields as Set<FilterableField>).has(field);

// Inspired by Google Analytics filter: https://developers.google.com/analytics/devguides/reporting/core/v3/reference?hl=en#filters
const operatorToSqlComparator = {
  '==': '=', // Exact match
  '!=': '!=', // Does not match
  '=@': 'ilike', // Contains sub string
  '<': '<', // Less than
  '<=': '<=', // Less than or equal
  '>': '>', // Greater than
  '>=': '>=', // Greater than or equal
} as const;
const operatorToSqlArrayComparator = {
  '==': 'IN', // Contained in array
  '!=': 'NOT IN', // Not contained in array
  '=@': undefined, // '@>' might be nice here, but none of our filterable fields are arrays
  '<': undefined,
  '<=': undefined,
  '>': undefined,
  '>=': undefined,
} as const;
type Operator = keyof typeof operatorToSqlComparator;

const filterOperators = Object.keys(operatorToSqlComparator) as Operator[];

type Value = RawValue | RawValue[];

const formatComparisonValue = (value: Value, operator: Operator) => {
  if (operator === '=@' && typeof value === 'string') {
    return `%${value}%`;
  }

  return value;
};

const formatValue = <T extends FilterableField>(field: T, value: RawValue) => {
  if (typeof value === 'string' && isNumericField(field)) {
    return parseFloat(value);
  }
  return value;
};

const convertValueToAdvancedCriteria = (
  field: FilterableField,
  operator: Operator,
  value: RawValue | RawValue[],
) => {
  let formattedValue: RawValue | RawValue[];

  if (Array.isArray(value)) {
    formattedValue = value.map(val => formatValue(field, val));
  } else {
    formattedValue =
      typeof value === 'string' && value.includes(MULTIPLE_VALUES_DELIMITER)
        ? (value
            .split(MULTIPLE_VALUES_DELIMITER)
            .map(val => formatValue(field, val)) as ExtractArrays<Value>)
        : formatValue(field, value);
  }

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

const toFilterClauseFromQueryString = (queryClause: string) => {
  const [operator] = filterOperators
    .filter(o => queryClause.includes(o))
    // Keep the longest matching operator, e.g. >= instead of >
    .sort((a, b) => b.length - a.length);

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

  const firstField = assertFilterableField(field);

  // return the field as passed in, because if it has a JSONB key, we want to keep it
  return [field, operator, value] as [typeof firstField, typeof operator, typeof value];
};

const toFilterClauseFromObject = ([field, value]: [
  string,
  string | AdvancedFilterValue<RawValue>,
]) => {
  const firstField = assertFilterableField(field);

  const valueIsString = typeof value === 'string';
  const operator = valueIsString ? '==' : (value.comparator as Operator);
  const actualValue = valueIsString ? value : value.comparisonValue;

  if (!filterOperators.includes(operator)) {
    throw new Error(`Unknown operator: ${operator}, must be one of: ${filterOperators}`);
  }

  // return the field as passed in, because if it has a JSONB key, we want to keep it
  return [field, operator, actualValue] as [typeof firstField, typeof operator, typeof actualValue];
};

export const extractFilterClausesFromQuery = (
  queryFilter?: string,
): [FilterableField, Operator, string][] | null => {
  if (!queryFilter) {
    return null;
  }

  return queryFilter.split(CLAUSE_DELIMITER).map(toFilterClauseFromQueryString);
};

export const extractFilterClausesFromObject = (queryObject?: QueryObject) => {
  if (!queryObject) {
    return null;
  }

  return Object.entries(queryObject).map(toFilterClauseFromObject);
};

const extractEntityFilter = (
  allowedCountries: Country['code'][],
  filterClauses?: [FilterableField, Operator, RawValue | RawValue[]][] | null,
): EntityFilter => {
  if (!filterClauses) {
    return getDefaultFilter(allowedCountries);
  }

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

export const extractEntityFilterFromQuery = (
  allowedCountries: Country['code'][],
  queryFilter?: string,
): EntityFilter => {
  const filterClauses = extractFilterClausesFromQuery(queryFilter);
  return extractEntityFilter(allowedCountries, filterClauses);
};

export const extractEntityFilterFromObject = (
  allowedCountries: Country['code'][],
  queryObject?: QueryObject,
): EntityFilter => {
  const filterClauses = extractFilterClausesFromObject(queryObject);
  return extractEntityFilter(allowedCountries, filterClauses);
};
