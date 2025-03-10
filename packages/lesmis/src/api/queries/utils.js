import { formatDateForApi, roundStartEndDates } from '@tupaia/utils';
import { MIN_DATA_YEAR, SINGLE_YEAR_GRANULARITY } from '../../constants';

/**
 *
 * @param year
 * @returns {{endDate: *, startDate: *}}
 */
export const yearToApiDates = year => {
  const currentYear = new Date().getFullYear().toString();
  const startYear = year || MIN_DATA_YEAR;
  const endYear = year || currentYear;
  const { startDate, endDate } = roundStartEndDates(SINGLE_YEAR_GRANULARITY, startYear, endYear);
  return { startDate: formatDateForApi(startDate), endDate: formatDateForApi(endDate) };
};

export const combineQueries = queryObject => {
  const queries = Object.values(queryObject);
  const error = queries.find(q => q.error)?.error ?? null;

  return {
    isLoading: !!queries.find(q => q.isLoading),
    isFetching: !!queries.find(q => q.isFetching),
    error,
    isError: !!error,
    data: Object.fromEntries(Object.entries(queryObject).map(([key, q]) => [key, q.data])),
  };
};
