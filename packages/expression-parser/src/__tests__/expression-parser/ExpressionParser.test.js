import MockDate from 'mockdate';

import { ExpressionParser } from '../../expression-parser';

describe('ExpressionParser', () => {
  describe('evaluate', () => {
    const CURRENT_DATE_STUB = '2020-12-15T00:00:00Z';

    beforeAll(() => {
      MockDate.set(CURRENT_DATE_STUB);
    });

    afterAll(() => {
      MockDate.reset();
    });

    const testData = [
      ['simple expression', '1 + 1', 2],
      ['average - one arg', 'avg(10)', 10],
      ['average - multiple args (same)', 'avg(10, 10, 10, 10)', 10],
      ['average - multiple args (different)', 'avg(0, 1, 2, 6)', 2.25],
      ['average - `undefined` arg', 'avg(undefined, 1, 2)', 1.5],
      ["average - `'undefined'` arg", "avg('undefined', 1, 2)", 1.5],
      ['date - simple', 'date()', new Date(CURRENT_DATE_STUB)],
      ['date - math', 'date().getMonth() * date().getDate()', (12 - 1) * 15],
      ['date - boolean (true)', 'date().getFullYear() > 2019', true],
      ['date - boolean (false)', 'date().getFullYear() <= 2019', false],
      ['firstExistingValue - one arg', 'firstExistingValue(1)', 1],
      ['firstExistingValue - multiple args', 'firstExistingValue(1, 2, 3, 4)', 1],
      ['firstExistingValue - includes zero', 'firstExistingValue(0, 1)', 0],
      ['firstExistingValue - ignores `undefined`', 'firstExistingValue(undefined, 1)', 1],
      ["firstExistingValue - ignores `'undefined'`", "firstExistingValue('undefined', 1)", 1],
      [
        'dateUtils - differenceInYears',
        `dateUtils.differenceInYears(date(), date('1993-12-18'))`,
        26,
      ],
      [
        'dateUtils - differenceInCalendarYears',
        `dateUtils.differenceInCalendarYears(date(), date('1993-12-18'))`,
        27,
      ], // More dateUtils functions from https://date-fns.org/v2.16.1/docs/Getting-Started
    ];

    const parser = new ExpressionParser();

    it.each(testData)('%s', (_, expression, expected) => {
      const received = parser.evaluate(expression);
      expect(received).toStrictEqual(expected);
    });
  });

  describe('getVariables()', () => {
    const testData = [
      ['single variable', 'x', ['x']],
      ['multiple variables', '2 * x + y + 1', ['x', 'y']],
      ['expression with parentheses', '(x + y) / z', ['x', 'y', 'z']],
      ['expression with functions', 'sqrt(cos(x)^2 + sin(y)^2)', ['x', 'y']],
      ['variable is repeated', '(x - y) / x', ['x', 'y']],
      ['longer variable names', 'alpha + beta - delta', ['alpha', 'beta', 'delta']],
      ['left side variable', 'x = 1', ['x']],
      ['variables at both sides', 'x = y', ['x', 'y']],
    ];

    const parser = new ExpressionParser();

    it.each(testData)('%s', (_, expression, expected) => {
      const variables = parser.getVariables(expression);
      expect(variables).toStrictEqual(expected);
    });
  });

  describe('getFunctions()', () => {
    const testData = [
      ['single function', 'cos(90)', ['cos']],
      ['multiple functions', 'cos(90) + sin(90)', ['cos', 'sin']],
      ['expression with parentheses', '(cos(3) + sin(30)) / sqrt(4)', ['cos', 'sin', 'sqrt']],
      ['same function is repeated', 'sin(45) / sin(30)', ['sin']],
      ['two-sided expression', 'x = sin(45)', ['sin']],
    ];

    const parser = new ExpressionParser();

    it.each(testData)('%s', (_, expression, expected) => {
      const functions = parser.getFunctions(expression);
      expect(functions).toStrictEqual(expected);
    });
  });
});
