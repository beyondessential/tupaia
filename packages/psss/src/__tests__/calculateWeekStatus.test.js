import { keyBy } from 'es-toolkit/compat';
import { REPORT_STATUSES } from '../constants';
import { reportsAreEqual, calculateWeekStatus } from '../utils';
import unconfirmedData from './fixtures/unConfirmedReport.json';
import confirmedData from './fixtures/confirmedReport.json';

describe('calculateWeekStatus', () => {
  const reportsByPeriod = keyBy(unconfirmedData.data.results, 'period');
  const confirmedReportsByPeriod = keyBy(confirmedData.data.results, 'period');

  it('checks reports with the same values are equal', async () => {
    expect(reportsAreEqual(reportsByPeriod['2020W24'], confirmedReportsByPeriod['2020W24'])).toBe(
      true,
    );

    expect(reportsAreEqual(reportsByPeriod['2020W25'], confirmedReportsByPeriod['2020W25'])).toBe(
      false,
    );
  });

  it('calculates status', async () => {
    expect(
      calculateWeekStatus(reportsByPeriod['2020W24'], confirmedReportsByPeriod['2020W24']),
    ).toBe(REPORT_STATUSES.SUBMITTED);

    expect(
      calculateWeekStatus(reportsByPeriod['2020W1'], confirmedReportsByPeriod['2011W25']),
    ).toBe(REPORT_STATUSES.OVERDUE);

    expect(
      calculateWeekStatus(reportsByPeriod['2020W25'], confirmedReportsByPeriod['2020W25']),
    ).toBe(REPORT_STATUSES.RESUBMIT);

    expect(
      calculateWeekStatus(reportsByPeriod['2020W23'], confirmedReportsByPeriod['2020W23']),
    ).toBe(REPORT_STATUSES.RESUBMIT);

    expect(
      calculateWeekStatus(reportsByPeriod['2020W22'], confirmedReportsByPeriod['2020W22']),
    ).toBe(REPORT_STATUSES.RESUBMIT);
  });
});
