import urlEncode from 'urlencode';

import { isDimension } from './dimensions';

const COMPARATOR_KEY = 'comparator';
const DEFAULT_COMPARATOR = 'eq';

/**
 * Builds a dhis2 query string from an input object
 *
 * Example:
 * ```js
 * const input = {
 *   fields: '[id, parent, name, coordinates]',
 *   filter: [{ name: 'countryunit' }, { name: 'province1', comparator: !eq }],
 *   rootJunction: 'OR',
 * };
 * const output = '?fields=[id, parent, name, coordinates]&filter=name:eq:countryunit&filter=name:!eq:province1&rootJunction=OR'
 * ```
 *
 * @param {Object<string, *>} query
 * @param {boolean} queryContinuation
 * @returns {string}
 */
export const stringifyDhisQuery = (query, queryContinuation = false) => {
  let queryString = '';
  // for each root key
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value === 'object') {
      // could be object or array
      if (Array.isArray(value)) {
        // if value is array, stringify differently for fields or other arrays
        queryString += key === 'fields' ? stringifyFieldsArray(value) : stringifyArray(key, value);
      } else {
        // this value is a filter object
        queryString += stringifyFilter(value);
      }
    } else {
      queryString += `&${key}=${value}`;
    }
  });
  const firstChar = queryContinuation ? '&' : '?';
  // replace & with ? if not queryContinuation
  return queryString.length > 0 ? `${firstChar}${queryString.slice(1)}` : '';
};

const stringifyFieldsArray = fields => {
  let returnQuery = '';

  fields.forEach(value => (returnQuery += `,${value}`));

  returnQuery = returnQuery.replace(/\\/, '');
  return `&fields=${returnQuery.slice(1)}`;
};

const stringifyArray = (key, array) => {
  let returnQuery = '';

  array.forEach(value => {
    if (typeof value === 'object') {
      // object this deep in the tree can only be filter, still check though
      if (key === 'filter') returnQuery += stringifyFilter(value);
    } else returnQuery += `&${key}=${value}`;
  });

  return returnQuery;
};

// separate filter object into individual filter= queries
const stringifyFilter = ({ comparator = DEFAULT_COMPARATOR, ...filterObject }) => {
  let returnQuery = '';
  Object.entries(filterObject).forEach(([key, value]) => {
    if (key === COMPARATOR_KEY) {
      return;
    }

    const queryParam = isDimension(key)
      ? `${key}=${value}`
      : `filter=${key}:${comparator}:${urlEncode(value)}`;
    returnQuery += `&${queryParam}`;
  });

  return returnQuery;
};
