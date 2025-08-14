import { useQueryClient } from '@tanstack/react-query';
import { calculateWeekStatus } from '../../utils';
import { REPORT_STATUSES } from '../../constants';
import { EMPTY_SYNDROME_DATA, getSyndromeData, useReport } from './helpers';

/**
 *
 * @param row
 * @returns [] eg. ['AFR', 'PF']
 */
const getAlerts = row =>
  Object.entries(row).reduce(
    (list, [key, value]) =>
      key.includes('Threshold Crossed') && value
        ? [...list, key.split(' Threshold Crossed')[0]]
        : list,
    [],
  );

const useCachedQuery = (endpoint, period, queryKey) => {
  const queryClient = useQueryClient();
  return useReport(
    endpoint,
    {
      params: { startWeek: period, endWeek: period },
    },
    {
      initialData: () => {
        // If we have a page of data, and we open a detail for a specific week, we don't want
        // to re-fetch the data for that week, so we get the specific week data from the cache
        const cachedQuery = queryClient.getQueryData([endpoint, queryKey]);
        const results = cachedQuery?.data?.results;

        if (!results) {
          return undefined;
        }

        if (results.length === 0) {
          return cachedQuery;
        }

        const record = results.filter(row => row.period === period);

        // If there are no results in the cache,
        // don't try to populate the query with initial data
        if (record.length === 0) {
          return undefined;
        }

        return { ...cachedQuery, data: { ...cachedQuery.data, results: record } };
      },
    },
  );
};

export const useSingleWeeklyReport = (orgUnit, period, verifiedStatuses, pageQueryKey) => {
  const reportQuery = useCachedQuery(`weeklyReport/${orgUnit}`, period, pageQueryKey);
  const confirmedReportQuery = useCachedQuery(
    `confirmedWeeklyReport/${orgUnit}`,
    period,
    pageQueryKey,
  );

  if (reportQuery.isLoading || confirmedReportQuery.isLoading || reportQuery.data.length === 0) {
    return {
      ...reportQuery,
      data: {
        Sites: 0,
        'Sites Reported': 0,
      },
      syndromes: EMPTY_SYNDROME_DATA,
      alerts: [],
      unVerifiedAlerts: [],
      reportStatus: REPORT_STATUSES.OVERDUE,
    };
  }

  const [report] = reportQuery.data;
  const [confirmedReport] = confirmedReportQuery?.data;
  const alerts = getAlerts(report);
  const unVerifiedAlerts = alerts.filter(a => !verifiedStatuses.includes(a));

  return {
    ...reportQuery,
    data: report,
    reportStatus: calculateWeekStatus(report, confirmedReport),
    syndromes: getSyndromeData(report),
    alerts,
    unVerifiedAlerts,
  };
};
