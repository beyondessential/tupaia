import {
  formatDateForDHIS2,
  formatDateTimeForDHIS2,
} from '../../../services/dhis/formatDateForDHIS2';

describe('formatDateForDHIS2()', () => {
  it('should format the date without converting it to a different timezone', () => {
    const testData = [
      ['2018-10-18', '2018-10-18'],
      ['2018-10-18T06:10:20-10:00', '2018-10-18'],
      ['2018-10-18T06:10:20+00:00', '2018-10-18'],
      ['2018-10-18T06:10:20+10:00', '2018-10-18'],
    ];
    testData.forEach(([input, expected]) => {
      expect(formatDateForDHIS2(input)).toStrictEqual(expected);
    });
  });
});

describe('formatDateTimeForDHIS2()', () => {
  it('should format the date without converting it to a different timezone', () => {
    const testData = [
      ['2018-10-18', '2018-10-18T00:00:00'],
      ['2018-10-18T06:10:20-10:00', '2018-10-18T06:10:20'],
      ['2018-10-18T06:10:20+00:00', '2018-10-18T06:10:20'],
      ['2018-10-18T06:10:20+10:00', '2018-10-18T06:10:20'],
    ];
    testData.forEach(([input, expected]) => {
      expect(formatDateTimeForDHIS2(input)).toStrictEqual(expected);
    });
  });
});
