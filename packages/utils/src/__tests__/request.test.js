/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { stringifyQuery } from '../request';

describe('request', () => {
  const BASE_URL = 'https://test-api.org';
  const ENDPOINT = 'reports';

  const assertUrlIsCorrect = (queryParams, expectedUrl) => {
    expect(stringifyQuery(BASE_URL, ENDPOINT, queryParams)).toBe(expectedUrl);
  };

  describe('stringifyQuery()', () => {
    it('no query params', () => {
      const expectedUrl = 'https://test-api.org/reports';

      expect(stringifyQuery(BASE_URL, ENDPOINT)).toBe(expectedUrl);
      [undefined, null, {}].forEach(queryParams => assertUrlIsCorrect(queryParams, expectedUrl));
    });

    it.each([
      ['`undefined` params', { a: undefined }, 'https://test-api.org/reports'],
      ['`undefined` params', { a: undefined }, 'https://test-api.org/reports'],
      ['`undefined` params', { a: 1, b: undefined }, 'https://test-api.org/reports?a=1'],
      ['`null` params', { a: undefined, b: 2 }, 'https://test-api.org/reports?b=2'],
      ['`null` params', { a: null }, 'https://test-api.org/reports'],
      ['`null` params', { a: 1, b: null }, 'https://test-api.org/reports?a=1'],
      ['one query param', { a: null, b: 2 }, 'https://test-api.org/reports?b=2'],
      ['two query params', { a: 1 }, 'https://test-api.org/reports?a=1'],
      ['special characters', { a: 1, b: 2 }, 'https://test-api.org/reports?a=1&b=2'],
      ['special characters', { a: '=test' }, 'https://test-api.org/reports?a=%3Dtest'],
      ['special characters', { '%value': 0.3 }, 'https://test-api.org/reports?%25value=0.3'],
      ['array query param', { '%value': '=test' }, 'https://test-api.org/reports?%25value=%3Dtest'],
      ['array query param', { a: [1] }, 'https://test-api.org/reports?a=1'],
      [
        'array query param with special characters',
        { a: [1, 2] },
        'https://test-api.org/reports?a=1&a=2',
      ],
      [
        'array query param with special characters',
        { a: [1, '=test'] },
        'https://test-api.org/reports?a=1&a=%3Dtest',
      ],
      [
        'array query param with special characters',
        { '%value': [0.63, 1] },
        'https://test-api.org/reports?%25value=0.63&%25value=1',
      ],
    ])('%s', (name, queryParams, expected) => {
      assertUrlIsCorrect(queryParams, expected);
    });
  });
});
