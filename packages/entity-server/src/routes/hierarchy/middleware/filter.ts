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

type FieldAndKey<T extends keyof NestedFilterQueryFields> = T extends `${infer Field}_${infer Key}`
  ? [Field, Key]
  : T;

const fieldAndKey = <T extends keyof NestedFilterQueryFields>(nestedField: T): FieldAndKey<T> => {
  return nestedField.split('_') as FieldAndKey<T>;
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

    const [unNestedField, key] = fieldAndKey(field);
    const existing = filter[unNestedField];
    if (existing) {
      const updated = { ...existing, [key]: parsedValue };
      filter[unNestedField] = updated;
    } else {
      filter[unNestedField] = { [key]: parsedValue };
    }
  });

  return filter as EntityFilter;
};
