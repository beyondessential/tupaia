import MockDate from 'mockdate';

import {
  getDisplayDatesByPeriod,
  getPeriodByDate,
  subtractWeeksFromPeriod,
  addWeeksToPeriod,
  getDaysTillDueDay,
} from '../utils';

describe('period', () => {
  it('Gets Display Dates By Period', async () => {
    expect(getDisplayDatesByPeriod('2020W24')).toEqual('Jun 8 - Jun 14, 2020');
    expect(getDisplayDatesByPeriod('2021W01')).toEqual('Jan 4 - Jan 10, 2021');
  });

  it('Gets Period By Date', async () => {
    expect(getPeriodByDate(new Date('06/06/2020'))).toEqual('2020W23');
    expect(getPeriodByDate(new Date('12/29/2019'))).toEqual('2019W52');
    expect(getPeriodByDate(new Date('12/31/2019'))).toEqual('2020W01');
    expect(getPeriodByDate(new Date('01/01/2020'))).toEqual('2020W01');
  });

  it('Subtracts Weeks From Period', async () => {
    expect(subtractWeeksFromPeriod('2020W24', 1)).toEqual('2020W23');
    expect(subtractWeeksFromPeriod('2020W24', 5)).toEqual('2020W19');
    expect(subtractWeeksFromPeriod('2018W01', 2)).toEqual('2017W51');
  });

  it('Adds Weeks to Period', async () => {
    expect(addWeeksToPeriod('2020W22', 1)).toEqual('2020W23');
    expect(addWeeksToPeriod('2020W14', 5)).toEqual('2020W19');
    expect(addWeeksToPeriod('2017W51', 2)).toEqual('2018W01');
  });

  it('Gets Days Till Due Day', async () => {
    const sunday = '2020-11-29';
    const monday = '2020-11-30';
    const tuesday = '2020-12-01';
    const wednesday = '2020-12-02';

    MockDate.set(sunday);
    expect(getDaysTillDueDay()).toEqual(-4);

    MockDate.set(monday);
    expect(getDaysTillDueDay()).toEqual(2);

    MockDate.set(tuesday);
    expect(getDaysTillDueDay()).toEqual(1);

    MockDate.set(wednesday);
    expect(getDaysTillDueDay()).toEqual(0);

    MockDate.reset();
  });
});
