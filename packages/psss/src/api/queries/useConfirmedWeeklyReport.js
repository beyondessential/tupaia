/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useLiveTableQuery } from '../useTableQuery';

export const useConfirmedWeeklyReport = (period, countryCodes) => {
  const query = useLiveTableQuery('confirmedWeeklyReport', {
    params: { startWeek: period },
  });

  const data = countryCodes.map(code => {
    const report = query.data.find(report => report.organisationUnit === code.toUpperCase());
    return report
      ? report
      : {
          organisationUnit: code.toUpperCase(),
        };
  });

  return {
    ...query,
    data,
  };
};
