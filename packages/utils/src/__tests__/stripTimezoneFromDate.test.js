import { stripTimezoneFromDate, reformatDateStringWithoutTz } from '../stripTimezoneFromDate';

describe('stripTimezoneFromDate', () => {
  it('Should return the same dateTime if no timezone specified', async () => {
    expect(stripTimezoneFromDate('2021-01-01 02:03:04')).toBe('2021-01-01T02:03:04.000');
    expect(stripTimezoneFromDate('2021-01-01 00:00:00')).toBe('2021-01-01T00:00:00.000');
    expect(stripTimezoneFromDate('2021-01-01')).toBe('2021-01-01T00:00:00.000');
  });

  it('Should strip the timezone if it is specified', async () => {
    expect(stripTimezoneFromDate('2021-01-01 02:03:04+05')).toBe('2021-01-01T02:03:04.000');
    expect(stripTimezoneFromDate('2021-01-01 02:03:04Z')).toBe('2021-01-01T02:03:04.000');
  });
});

describe('reformatDateStringWithoutTz', () => {
  it('Should reformat', async () => {
    expect(reformatDateStringWithoutTz('2021-01-01 02:03:04')).toBe('2021-01-01T02:03:04.000');
    expect(reformatDateStringWithoutTz('2021-01-01T00:00:00')).toBe('2021-01-01T00:00:00.000');
  });

  it('Should return null if a timezone is specified', async () => {
    expect(reformatDateStringWithoutTz('2021-01-01 02:03:04+05')).toBe(null);
    expect(reformatDateStringWithoutTz('2021-01-01T02:03:04+05')).toBe(null);
    expect(reformatDateStringWithoutTz('2021-01-01 02:03:04Z')).toBe(null);
    expect(reformatDateStringWithoutTz('2021-01-01T02:03:04Z')).toBe(null);
  });

  it('Should return null if an unknown format is used', async () => {
    expect(reformatDateStringWithoutTz('1 Jan 2021')).toBe(null);
    expect(reformatDateStringWithoutTz('2021-01-01')).toBe(null);
  });
});
