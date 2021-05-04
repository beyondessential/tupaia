/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { formatDateForApi, roundStartEndDates } from '@tupaia/ui-components/lib/chart';
import { MIN_DATA_YEAR, SINGLE_YEAR_GRANULARITY } from '../../constants';

/**
 *
 * @param year
 * @returns {{endDate: *, startDate: *}}
 */
export const yearToApiDates = year => {
  const currentYear = new Date().getFullYear().toString();
  const startYear = !year ? MIN_DATA_YEAR : year;
  const endYear = !year ? currentYear : year;
  const { startDate, endDate } = roundStartEndDates(SINGLE_YEAR_GRANULARITY, startYear, endYear);
  return { startDate: formatDateForApi(startDate), endDate: formatDateForApi(endDate) };
};
