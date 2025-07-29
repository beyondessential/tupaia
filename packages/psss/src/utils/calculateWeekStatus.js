import { isEqual } from 'es-toolkit/compat';
import { REPORT_STATUSES } from '../constants';

const extractReportData = report => {
  const { AFR, DIA, DLI, ILI, PF, Sites, 'Sites Reported': sitesReported } = report;
  return { AFR, DIA, DLI, ILI, PF, Sites, sitesReported };
};

export const reportsAreEqual = (reportA, reportB) => {
  const a = extractReportData(reportA);
  const b = extractReportData(reportB);
  return isEqual(a, b);
};

export const calculateWeekStatus = (report, confirmedReport) => {
  if (!confirmedReport || !report) {
    return REPORT_STATUSES.OVERDUE;
  }

  return reportsAreEqual(report, confirmedReport)
    ? REPORT_STATUSES.SUBMITTED
    : REPORT_STATUSES.RESUBMIT;
};
