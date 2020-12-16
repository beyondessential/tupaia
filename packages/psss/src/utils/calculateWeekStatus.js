/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import isequal from 'lodash.isequal';
import { REPORT_STATUSES } from '../constants';

const extractReportData = report => {
  const { AFR, DIA, DLI, ILI, PF } = report;
  return { AFR, DIA, DLI, ILI, PF };
};

export const reportsAreEqual = (reportA, reportB) => {
  const a = extractReportData(reportA);
  const b = extractReportData(reportB);
  return isequal(a, b);
};

export const calculateWeekStatus = (report, confirmedReport) => {
  if (!confirmedReport || !report) {
    return REPORT_STATUSES.OVERDUE;
  }

  return reportsAreEqual(report, confirmedReport)
    ? REPORT_STATUSES.SUBMITTED
    : REPORT_STATUSES.RESUBMIT;
};
