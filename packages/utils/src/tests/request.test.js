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

    it('`undefined` params', () => {
      assertUrlIsCorrect({ a: undefined }, 'https://test-api.org/reports');
      assertUrlIsCorrect({ a: 1, b: undefined }, 'https://test-api.org/reports?a=1');
      assertUrlIsCorrect({ a: undefined, b: 2 }, 'https://test-api.org/reports?b=2');
    });

    it('`null` params', () => {
      assertUrlIsCorrect({ a: null }, 'https://test-api.org/reports');
      assertUrlIsCorrect({ a: 1, b: null }, 'https://test-api.org/reports?a=1');
      assertUrlIsCorrect({ a: null, b: 2 }, 'https://test-api.org/reports?b=2');
    });

    it('one query param', () => {
      assertUrlIsCorrect({ a: 1 }, 'https://test-api.org/reports?a=1');
    });

    it('two query params', () => {
      assertUrlIsCorrect({ a: 1, b: 2 }, 'https://test-api.org/reports?a=1&b=2');
    });

    it('special characters', () => {
      assertUrlIsCorrect({ a: '=test' }, 'https://test-api.org/reports?a=%3Dtest');
      assertUrlIsCorrect({ '%value': 0.3 }, 'https://test-api.org/reports?%25value=0.3');
      assertUrlIsCorrect({ '%value': '=test' }, 'https://test-api.org/reports?%25value=%3Dtest');
    });

    it('array query param', () => {
      assertUrlIsCorrect({ a: [1] }, 'https://test-api.org/reports?a=1');
      assertUrlIsCorrect({ a: [1, 2] }, 'https://test-api.org/reports?a=1&a=2');
    });

    it('array query param with special characters', () => {
      assertUrlIsCorrect({ a: [1, '=test'] }, 'https://test-api.org/reports?a=1&a=%3Dtest');
      assertUrlIsCorrect(
        { '%value': [0.63, 1] },
        'https://test-api.org/reports?%25value=0.63&%25value=1',
      );
      assertUrlIsCorrect(
        { '%value': [1, '=test'] },
        'https://test-api.org/reports?%25value=1&%25value=%3Dtest',
      );
    });
  });
});
