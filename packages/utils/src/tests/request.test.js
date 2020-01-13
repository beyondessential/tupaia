/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { stringifyQuery } from '../request';

describe('request', () => {
  const BASE_URL = 'https://test-api.org';
  const ENDPOINT = 'reports';

  const assertUrlIsExpected = (queryParams, expectedUrl) => {
    expect(stringifyQuery(BASE_URL, ENDPOINT, queryParams)).to.equal(expectedUrl);
  };

  describe('stringifyQuery()', () => {
    it('no query params', () => {
      const expectedUrl = 'https://test-api.org/reports';

      expect(stringifyQuery(BASE_URL, ENDPOINT)).to.equal(expectedUrl);
      [undefined, null, {}].forEach(queryParams => assertUrlIsExpected(queryParams, expectedUrl));
    });

    it('`undefined` params', () => {
      assertUrlIsExpected({ a: undefined }, 'https://test-api.org/reports');
      assertUrlIsExpected({ a: 1, b: undefined }, 'https://test-api.org/reports?a=1');
      assertUrlIsExpected({ a: undefined, b: 2 }, 'https://test-api.org/reports?b=2');
    });

    it('`null` params', () => {
      assertUrlIsExpected({ a: null }, 'https://test-api.org/reports');
      assertUrlIsExpected({ a: 1, b: null }, 'https://test-api.org/reports?a=1');
      assertUrlIsExpected({ a: null, b: 2 }, 'https://test-api.org/reports?b=2');
    });

    it('one query param', () => {
      assertUrlIsExpected({ a: 1 }, 'https://test-api.org/reports?a=1');
    });

    it('two query params', () => {
      assertUrlIsExpected({ a: 1, b: 2 }, 'https://test-api.org/reports?a=1&b=2');
    });

    it('special characters', () => {
      assertUrlIsExpected({ a: '=test' }, 'https://test-api.org/reports?a=%3Dtest');
      assertUrlIsExpected({ '%value': 0.3 }, 'https://test-api.org/reports?%25value=0.3');
      assertUrlIsExpected({ '%value': '=test' }, 'https://test-api.org/reports?%25value=%3Dtest');
    });

    it('array query param', () => {
      assertUrlIsExpected({ a: [1] }, 'https://test-api.org/reports?a=1');
      assertUrlIsExpected({ a: [1, 2] }, 'https://test-api.org/reports?a=1&a=2');
    });

    it('array query param with special characters', () => {
      assertUrlIsExpected({ a: [1, '=test'] }, 'https://test-api.org/reports?a=1&a=%3Dtest');
      assertUrlIsExpected(
        { '%value': [0.63, 1] },
        'https://test-api.org/reports?%25value=0.63&%25value=1',
      );
      assertUrlIsExpected(
        { '%value': [1, '=test'] },
        'https://test-api.org/reports?%25value=1&%25value=%3Dtest',
      );
    });
  });
});
