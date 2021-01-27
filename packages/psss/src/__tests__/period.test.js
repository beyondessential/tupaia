/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
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
    const sunday = new Date(1606561200000); // Sun 29th November 2020
    const monday = new Date(1606647600000); // Mon 30th November 2020
    const tuesday = new Date(1606734000000); // Tuesday 1st December 2020
    const wednesday = new Date(1606820400000); // Wednesday 2nd December 2020

    let spy = jest.spyOn(global, 'Date').mockImplementation(() => sunday);
    expect(getDaysTillDueDay()).toEqual(-4);
    spy.mockRestore();

    spy = jest.spyOn(global, 'Date').mockImplementation(() => monday);
    expect(getDaysTillDueDay()).toEqual(2);
    spy.mockRestore();

    spy = jest.spyOn(global, 'Date').mockImplementation(() => tuesday);
    expect(getDaysTillDueDay()).toEqual(1);
    spy.mockRestore();

    spy = jest.spyOn(global, 'Date').mockImplementation(() => wednesday);
    expect(getDaysTillDueDay()).toEqual(0);
    spy.mockRestore();
  });
});
