/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getCurrentPeriod } from '@tupaia/utils';
import { useQuery } from 'react-query';
import { subtractPeriod, getDaysRemaining } from '../../utils';
import { get } from '../api';
import { REPORT_STATUSES } from '../../constants';

export const useUpcomingReport = countryCode => {
  const currentPeriod = getCurrentPeriod('WEEK');
  const lastPeriod = subtractPeriod(currentPeriod, 1);
  const endpoint = `confirmedWeeklyReport/${countryCode.toUpperCase()}`;
  const query = useQuery(
    [endpoint, lastPeriod],
    () => get(endpoint, { params: { startWeek: lastPeriod, endWeek: lastPeriod } }),
    { staleTime: 60 * 1000 },
  );

  const data = query?.data?.data?.results ? query.data.data.results : [];

  const { isLoading } = query;

  if (isLoading) {
    return query;
  }

  const isConfirmed = data.length > 0;

  const days = getDaysRemaining();

  if (isConfirmed) {
    const totalDays = days + 7;

    return {
      ...query,
      data,
      reportStatus: REPORT_STATUSES.UPCOMING,
      period: currentPeriod,
      days: totalDays,
    };
  }

  const status = days > 0 ? REPORT_STATUSES.UPCOMING : REPORT_STATUSES.OVERDUE;

  return {
    ...query,
    data,
    reportStatus: status,
    period: lastPeriod,
    days,
  };
};
