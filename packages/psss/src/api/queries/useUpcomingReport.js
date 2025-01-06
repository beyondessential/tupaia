/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from '@tanstack/react-query';
import { subtractWeeksFromPeriod, getDaysTillDueDay, getCurrentPeriod } from '../../utils';
import { get } from '../api';
import { REPORT_STATUSES } from '../../constants';

export const useUpcomingReport = countryCode => {
  const currentPeriod = getCurrentPeriod();
  const lastPeriod = subtractWeeksFromPeriod(currentPeriod, 1);
  const endpoint = `confirmedWeeklyReport/${countryCode.toUpperCase()}`;
  const query = useQuery(
    [endpoint, lastPeriod],
    () => get(endpoint, { params: { startWeek: lastPeriod, endWeek: lastPeriod } }),
    { staleTime: 60 * 1000 * 5 },
  );

  const data = query?.data?.data?.results ?? [];

  const { isLoading } = query;

  if (isLoading) {
    return query;
  }

  const isConfirmed = data.length > 0;

  const daysTillDueDay = getDaysTillDueDay();

  if (isConfirmed) {
    const totalDays = daysTillDueDay + 7;

    return {
      ...query,
      data,
      reportStatus: REPORT_STATUSES.UPCOMING,
      period: currentPeriod,
      daysTillDueDay: totalDays,
    };
  }

  const status = daysTillDueDay >= 0 ? REPORT_STATUSES.UPCOMING : REPORT_STATUSES.OVERDUE;

  return {
    ...query,
    data,
    reportStatus: status,
    period: lastPeriod,
    daysTillDueDay,
  };
};
