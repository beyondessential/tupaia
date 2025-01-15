import { fetchWithTimeout, stringifyQuery } from '../request';

jest.mock('node-fetch', () =>
  jest.fn().mockImplementation(
    () =>
      new Promise(resolve => {
        setTimeout(() => resolve('success'), 20); // mock fetch takes 20 ms to resolve
      }),
  ),
);

describe('request', () => {
  const BASE_URL = 'https://test-api.org';
  const ENDPOINT = 'reports';

  describe('fetchWithTimeout()', () => {
    it('resolves with request response if request is fast enough', async () => {
      return expect(fetchWithTimeout(BASE_URL, {}, 40)).resolves.toEqual('success');
    });

    it('throws an error if request is too slow', () => {
      return expect(fetchWithTimeout(BASE_URL, {}, 10)).rejects.toThrow(/request timed out/);
    });
  });

  describe('stringifyQuery()', () => {
    const testData = [
      [
        'no query params',
        [
          [undefined, 'https://test-api.org/reports'],
          [null, 'https://test-api.org/reports'],
          [{}, 'https://test-api.org/reports'],
        ],
      ],
      [
        '`undefined` params',
        [
          [{ a: undefined }, 'https://test-api.org/reports'],
          [{ a: 1, b: undefined }, 'https://test-api.org/reports?a=1'],
          [{ a: undefined, b: 2 }, 'https://test-api.org/reports?b=2'],
        ],
      ],
      [
        '`null` params',
        [
          [{ a: null }, 'https://test-api.org/reports'],
          [{ a: 1, b: null }, 'https://test-api.org/reports?a=1'],
          [{ a: null, b: 2 }, 'https://test-api.org/reports?b=2'],
        ],
      ],
      ['one query param', [[{ a: 1 }, 'https://test-api.org/reports?a=1']]],
      ['two query params', [[{ a: 1, b: 2 }, 'https://test-api.org/reports?a=1&b=2']]],
      [
        'special characters',
        [
          [{ a: '=test' }, 'https://test-api.org/reports?a=%3Dtest'],
          [{ '%value': 0.3 }, 'https://test-api.org/reports?%25value=0.3'],
          [{ '%value': '=test' }, 'https://test-api.org/reports?%25value=%3Dtest'],
        ],
      ],
      [
        'array query param',
        [
          [{ a: [1] }, 'https://test-api.org/reports?a=1'],
          [{ a: [1, 2] }, 'https://test-api.org/reports?a=1&a=2'],
        ],
      ],
      [
        'array query param with special characters',
        [
          [{ a: [1, '=test'] }, 'https://test-api.org/reports?a=1&a=%3Dtest'],
          [{ '%value': [0.63, 1] }, 'https://test-api.org/reports?%25value=0.63&%25value=1'],
          [{ '%value': [1, '=test'] }, 'https://test-api.org/reports?%25value=1&%25value=%3Dtest'],
        ],
      ],
    ];

    it.each(testData)('%s', (_, testCaseData) => {
      testCaseData.forEach(([queryParams, expected]) => {
        expect(stringifyQuery(BASE_URL, ENDPOINT, queryParams)).toBe(expected);
      });
    });
  });
});
