/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { compareAsc } from './compare';

export const countDistinct = (array: any[], mapperInput?: ((x: any) => any) | string) => {
  const getMapper = () => {
    switch (typeof mapperInput) {
      case 'function':
        return (value: any) => mapperInput(value);
      case 'string':
        return (value: string) => {
          if (typeof value != 'object') throw new Error('Array item must be an object');
          return value[mapperInput];
        };
      default:
        return (value: any) => value;
    }
  };

  const mapItem = getMapper();
  return new Set(array.map(mapItem)).size;
};

export const hasIntersection = (input1: any[], input2: any[]) => {
  const set1 = new Set(input1);
  const set2 = new Set(input2);

  for (const v of set1) {
    if (set2.has(v)) {
      return true;
    }
  }
  return false;
};

export const min = <T>(array: T[]): T | undefined =>
  Array.isArray(array) && array.length > 0
    ? array.reduce((result, value) => (compareAsc(value, result) <= 0 ? value : result), array[0])
    : undefined;

export const max = <T>(array: T[]): T | undefined =>
  Array.isArray(array) && array.length > 0
    ? array.reduce((result, value) => (compareAsc(value, result) >= 0 ? value : result), array[0])
    : undefined;

// left without generics because the caller migrating to ts will remove the need for this helper fn
export const toArray = (input: any[] | any) => (Array.isArray(input) ? input : [input]);

export const asyncFilter = async <T>(array: T[], predicate: (x: any) => any) =>
  Promise.all(array.map(predicate)).then(results => array.filter((_v, index) => results[index]));

// https://advancedweb.hu/how-to-use-async-functions-with-array-some-and-every-in-javascript/
export const asyncEvery = async (array: any[], predicate: (x: any) => any) =>
  (await asyncFilter(array, predicate)).length === array.length;

export const removeAt = <T>(array: T[], index: number): T[] => {
  return [...array.slice(0, index), ...array.slice(index + 1)];
};
