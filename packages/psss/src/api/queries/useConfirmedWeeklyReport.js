/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useTableData } from './useTableData';

export const useConfirmedWeeklyReport = (period, countryCodes) => {
  const query = useTableData('confirmedWeeklyReport', {
    params: { startWeek: period },
  });

  const data = countryCodes.map(code => {
    const report = query.data.find(r => r.organisationUnit === code);
    return (
      report || {
        organisationUnit: code,
      }
    );
  });

  return {
    ...query,
    data,
  };
};
