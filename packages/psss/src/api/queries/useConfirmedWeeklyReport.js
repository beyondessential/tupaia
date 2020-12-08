/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';
import { useTableData } from './useTableData';

export const useConfirmedWeeklyReport = (period, countryCodes) => {
  const query = useTableData('confirmedWeeklyReport', {
    params: { startWeek: period },
  });

  // Fill empty data if required so that every org unit renders as a row in the table
  const reportsByOrgUnit = keyBy(query.data, 'organisationUnit');
  const data = countryCodes.map(
    orgUnit => reportsByOrgUnit[orgUnit] || { organisationUnit: orgUnit },
  );

  return {
    ...query,
    data,
  };
};
