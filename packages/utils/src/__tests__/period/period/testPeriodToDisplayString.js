import { periodToDisplayString, PERIOD_TYPES } from '../../../period/period';

const { DAY, WEEK, MONTH, QUARTER, YEAR } = PERIOD_TYPES;

export const testPeriodToDisplayString = () => {
  const testData = [
    [
      'target type: year',
      [
        ['2019', '2019'],
        ['2019Q3', '2019'],
        ['201912', '2019'],
        ['2019W12', '2019'],
        ['20191202', '2019'],
      ],
      YEAR,
    ],
    [
      'target type: quarter',
      [
        ['2019', 'Q1 2019'],
        ['2019Q3', 'Q3 2019'],
        ['201912', 'Q4 2019'],
        ['2019W49', 'Q4 2019'],
        ['20191202', 'Q4 2019'],
      ],
      QUARTER,
    ],
    [
      'target type: month',
      [
        ['2019', 'Jan 2019'],
        ['2019Q3', 'Jul 2019'],
        ['201912', 'Dec 2019'],
        ['2019W49', 'Dec 2019'],
        ['20191202', 'Dec 2019'],
      ],
      MONTH,
    ],
    [
      'target type: week',
      [
        ['2019', '1st Jan 2019'],
        ['2019Q3', '1st Jul 2019'],
        ['201912', '1st Dec 2019'],
        ['2019W49', '2nd Dec 2019'],
        ['20191202', '2nd Dec 2019'],
      ],
      WEEK,
    ],
    [
      'target type: day',
      [
        ['2019', '1st Jan 2019'],
        ['2019Q3', '1st Jul 2019'],
        ['201912', '1st Dec 2019'],
        ['2019W48', '25th Nov 2019'],
        ['2019W49', '2nd Dec 2019'],
        ['20191202', '2nd Dec 2019'],
      ],
      DAY,
    ],
    [
      'target type: undefined - should default to the period type of the input',
      [
        ['2019', '2019'],
        ['2019Q3', 'Q3 2019'],
        ['201912', 'Dec 2019'],
        ['20191202', '2nd Dec 2019'],
      ],
      undefined,
    ],
  ];

  it.each(testData)('%s', (_, testCaseData, periodType) => {
    testCaseData.forEach(([period, expected]) => {
      expect(periodToDisplayString(period, periodType)).toBe(expected);
    });
  });
};
