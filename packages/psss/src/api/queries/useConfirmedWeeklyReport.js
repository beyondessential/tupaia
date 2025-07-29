import { keyBy } from 'es-toolkit/compat';
import { usePaginatedReport } from './helpers';

export const useConfirmedWeeklyReport = (period, orgUnitCodes) => {
  const params = { startWeek: period, endWeek: period, orgUnitCodes: orgUnitCodes.join(',') };
  const query = usePaginatedReport('confirmedWeeklyReport', { params });

  // Fill empty data if required so that every org unit renders as a row in the table
  const reportsByOrgUnit = keyBy(query.data, 'organisationUnit');
  const data = orgUnitCodes.map(
    orgUnit => reportsByOrgUnit[orgUnit] || { organisationUnit: orgUnit },
  );

  return {
    ...query,
    data,
  };
};
