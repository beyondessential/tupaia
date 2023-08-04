/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { yearToApiDates } from '../api/queries/utils';
import { DEFAULT_DATA_YEAR } from '../constants';
import { useUrlSearchParams } from './useUrlSearchParams';
import { useIsFavouriteDashboardSelected } from './useIsFavouriteDashboardSelected';
import { useDashboardDropdownOptions } from './useDashboardDropdownOptions';

export const useStartAndEndDates = periodGranularity => {
  const { selectedOption } = useDashboardDropdownOptions();
  const { useYearSelector } = selectedOption;
  const isFavouriteDashboardSelected = useIsFavouriteDashboardSelected();

  if (isFavouriteDashboardSelected) {
    return yearToApiDates(DEFAULT_DATA_YEAR);
  }

  const [{ startDate, endDate, year }] = useUrlSearchParams();
  if (startDate || endDate) {
    return { startDate, endDate };
  }
  if (useYearSelector) {
    const selectedYear = year || DEFAULT_DATA_YEAR;
    return yearToApiDates(selectedYear);
  }

  const startAndEndDates =
    periodGranularity === 'one_year_at_a_time'
      ? yearToApiDates(DEFAULT_DATA_YEAR)
      : yearToApiDates();

  return startAndEndDates;
};
