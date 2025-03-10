import moment from 'moment';

import { utcMoment } from '../../datetime';

import { addMomentOffset } from '../../period/addMomentOffset';

const UTC_ISO_DATE_LENGTH = 'yyyy-mm-ddThh:mm:ssZ'.length;

// Eg '2019-06-07' => '2019-06-07T00:00:00Z'
const utc = date => `${date}T00:00:00Z`.substring(0, UTC_ISO_DATE_LENGTH);

describe('addMomentOffset', () => {
  const testData = [
    // unit, offset
    ['unit is empty - uses input date', ['2019-06-07', {}], '2019-06-07'],
    ['unit is invalid - uses input date', ['2019-06-07', { unit: 'invalid' }], '2019-06-07'],
    ['unit: year,    + offset', ['2019-06-07', { offset: +2, unit: 'YEAR' }], '2021-06-07'],
    ['unit: year,    - offset', ['2019-06-07', { offset: -2, unit: 'YEAR' }], '2017-06-07'],
    ['unit: quarter, + offset', ['2019-06-07', { offset: +2, unit: 'QUARTER' }], '2019-12-07'],
    ['unit: quarter, - offset', ['2019-06-07', { offset: -2, unit: 'QUARTER' }], '2018-12-07'],
    ['unit: month,   + offset', ['2019-06-07', { offset: +2, unit: 'MONTH' }], '2019-08-07'],
    ['unit: month,   - offset', ['2019-06-07', { offset: -2, unit: 'MONTH' }], '2019-04-07'],
    ['unit: week,    + offset', ['2019-06-07', { offset: +2, unit: 'WEEK' }], '2019-06-21'],
    ['unit: week,    - offset', ['2019-06-07', { offset: -2, unit: 'WEEK' }], '2019-05-24'],
    ['unit: day,     + offset', ['2019-06-07', { offset: +2, unit: 'DAY' }], '2019-06-09'],
    ['unit: day,     - offset', ['2019-06-07', { offset: -2, unit: 'DAY' }], '2019-06-05'],
    [
      'unit is lowercase - converts to uppercase',
      ['2019-06-07', { offset: +2, unit: 'year' }],
      '2021-06-07',
    ],
    // modifier, modifierUnit
    [
      'modifier is empty - does not modify date',
      ['2019-06-07', { unit: 'year', modifierUnit: 'month' }],
      '2019-06-07',
    ],
    [
      'modifier is invalid - does not modify date',
      ['2019-06-07', { unit: 'year', modifier: 'invalid', modifierUnit: 'month' }],
      '2019-06-07',
    ],
    [
      'modifier: start_of',
      ['2019-06-07', { unit: 'year', offset: -2, modifier: 'start_of', modifierUnit: 'year' }],
      '2017-01-01T00:00:00Z',
    ],
    [
      'modifier: end_of',
      ['2019-06-07', { unit: 'year', offset: +2, modifier: 'end_of', modifierUnit: 'year' }],
      '2021-12-31T23:59:59Z',
    ],
    [
      'modifier is valid, modifierUnit is empty - uses unit',
      ['2019-06-07', { unit: 'year', offset: +2, modifier: 'end_of' }],
      '2021-12-31T23:59:59Z',
    ],
    [
      'modifier is valid, modifierUnit is not empty - uses modifierUnit',
      ['2019-06-07', { unit: 'year', offset: +2, modifier: 'end_of', modifierUnit: 'month' }],
      '2021-06-30T23:59:59Z',
    ],
    [
      'modifier is valid, offset is empty - does not apply offset',
      ['2019-06-07', { unit: 'year', modifier: 'end_of', modifierUnit: 'year' }],
      '2019-12-31T23:59:59Z',
    ],
  ];

  it.each(testData)('%s', (_, [date, dateOffset], expected) => {
    const received = addMomentOffset(utcMoment(date), dateOffset);
    expect(received.format()).toBe(utc(expected));
  });

  it('respects the timezone in the input', () => {
    const date = '2021-01-01T14:00:00+10:00';
    const dateOffset = { unit: 'day', offset: +2 };

    const received = addMomentOffset(moment(date), dateOffset);
    expect(received.utcOffset(+10).format()).toBe('2021-01-03T14:00:00+10:00');
  });
});
