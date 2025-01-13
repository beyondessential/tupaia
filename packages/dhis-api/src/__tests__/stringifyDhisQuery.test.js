import * as Dimensions from '../dimensions';
import { stringifyDhisQuery } from '../stringifyDhisQuery';

const DIMENSION = 'dimension';
const isDimensionMock = jest.spyOn(Dimensions, 'isDimension');
isDimensionMock.mockImplementation(key => key === DIMENSION);

describe('stringifyDhisQuery', () => {
  describe('no filter', () => {
    const testData = [
      ['should stringify a query object with one entry', { code: 'test' }, '?code=test'],
      [
        'should stringify a query object with multiple entries',
        { id: 1, code: 'test' },
        '?id=1&code=test',
      ],
      ['should ignore undefined value', { code: 'test', id: undefined }, '?code=test'],
      ['should ignore null value', { code: 'test', id: null }, '?code=test'],
      ['should stringify array values', { dataElements: [1, 2] }, '?dataElements=1&dataElements=2'],
      [
        'should correctly stringify a "fields" array',
        { fields: ['id', 'code'] },
        '?fields=id,code',
      ],
    ];

    it.each(testData)('%s', (_, query, expected) => {
      expect(stringifyDhisQuery(query)).toBe(expected);
    });
  });

  describe('query continuation', () => {
    it('should do not use query continuation by default', () => {
      expect(stringifyDhisQuery({ code: 'test' })).toBe(
        stringifyDhisQuery({ code: 'test' }, false),
      );
    });

    it('should support query continuation', () => {
      expect(stringifyDhisQuery({ code: 'test' }, true)).toBe('&code=test');
    });
  });

  describe('with filter', () => {
    const testData = [
      [
        'should stringify a filter object containing one entry',
        { filter: { id: 'test' } },
        '?filter=id:eq:test',
      ],
      [
        'should stringify a filter object containing multiple entries',
        { filter: { id: 'testId', code: 'testCode' } },
        '?filter=id:eq:testId&filter=code:eq:testCode',
      ],
      [
        'should url encode the stringified a filter object',
        { filter: { id: 'a space' } },
        '?filter=id:eq:a%20space',
      ],
      [
        'should stringify a filter object containing a dimension key',
        { filter: { [DIMENSION]: 'testOu' } },
        `?${DIMENSION}=testOu`,
      ],
      [
        'should stringify a filter object containing a comparator key',
        { filter: { id: 'testId', comparator: 'comp' } },
        '?filter=id:comp:testId',
      ],
      [
        'should stringify a "filter" array with a single element',
        { filter: [{ id: 'testId' }] },
        '?filter=id:eq:testId',
      ],
      [
        'should stringify a "filter" array with multiple elements',
        { filter: [{ id: 'testId' }, { code: 'testCode' }] },
        '?filter=id:eq:testId&filter=code:eq:testCode',
      ],
      [
        'should ignore an array of objects which is not a "filter" ',
        { noFilter: [{ id: 'testId' }] },
        '',
      ],
      ['should return an empty string for an empty input', {}, ''],
      ['should return an empty string for undefined values', { code: undefined }, ''],
      ['should return an empty string for null values', { code: null }, ''],
    ];

    it.each(testData)('%s', (_, query, expected) => {
      expect(stringifyDhisQuery(query)).toBe(expected);
    });
  });
});
