/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Writable } from '../../../types';
import { EntityFilter } from '../../../models';
import { EntityFilterQuery, NestedFilterQueryFields } from '../types';

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

type JsonBKey<T extends keyof NestedFilterQueryFields> = T extends `${infer Field}_${infer Key}`
  ? `${Field}->>${Key}`
  : T;

const toJsonBKey = <T extends keyof NestedFilterQueryFields>(nestedField: T): JsonBKey<T> => {
  const [field, value] = nestedField.split('_');
  return [field, value].join('->>') as JsonBKey<T>;
};

export const extractFilterFromQuery = (queryFilter?: EntityFilterQuery) => {
  if (!queryFilter) {
    return {};
  }

  const filter: Writable<EntityFilter> = {};

  Object.entries(queryFilter).forEach(([field, value]) => {
    if (value === undefined) {
      return;
    }

    if (!isFilterableField(field)) {
      return;
    }

    const parsedValue = value.includes(',') ? value.split(',') : value;

    if (!isNestedField(field)) {
      filter[field] = parsedValue;
      return;
    }

    const jsonBKey = toJsonBKey(field);
    filter[jsonBKey] = parsedValue;
  });

  return filter as EntityFilter;
};
