/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ArithmeticBuilder } from '../../../Builder/ArithmeticBuilder/ArithmeticBuilder';
import { DbRecord } from '../../../types';

/**
 * Note: `testBuilder` instantiation is stubbed in the test file calling this function
 * This is because apparently `jest.mock` only works in files loaded by the test runner,
 * and not in other files called by them (as is the case here)
 */
export const testGetElementCodes = () => {
  const testData: [string, DbRecord, string[]][] = [
    ['single element in formula', { formula: 'A' }, ['A']],
    ['multiple elements in formula', { formula: 'A + B' }, ['A', 'B']],
    ['repeated elements in formula', { formula: '(A + B) / A' }, ['A', 'B']],
    [
      'all elements are parameters',
      {
        formula: 'ParamA + ParamB',
        parameters: [
          {
            code: 'ParamA',
            builder: 'testBuilder',
            config: { elementCodes: ['ParamElementA', 'ParamElementB'] },
          },
          {
            code: 'ParamB',
            builder: 'testBuilder',
            config: { elementCodes: ['ParamElementC', 'ParamElementD'] },
          },
        ],
      },
      ['ParamElementA', 'ParamElementB', 'ParamElementC', 'ParamElementD'],
    ],
    [
      'elements are both parameters and non parameters',
      {
        formula: 'A + ParamA',
        parameters: [
          {
            code: 'ParamA',
            builder: 'testBuilder',
            config: { elementCodes: ['ParamElementA', 'ParamElementB'] },
          },
        ],
      },
      ['A', 'ParamElementA', 'ParamElementB'],
    ],
  ];

  it.each(testData)('%s', (_, config, expected) => {
    const indicator = {
      code: 'testIndicator',
      builder: 'arithmetic',
      config: { aggregation: 'RAW', ...config },
    };
    const builder = new ArithmeticBuilder(indicator);
    return expect(builder.getElementCodes()).toIncludeSameMembers(expected);
  });
};
