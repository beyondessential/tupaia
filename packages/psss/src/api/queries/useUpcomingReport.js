/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getCurrentPeriod } from '@tupaia/utils';
import { useQuery } from 'react-query';
import { subtractPeriod } from '../../utils';
import { get } from '../api';
import { getISODay } from 'date-fns';

const DUE_ISO_DAY = 3; // wednesday

const STATUS = {
  DEFAULT: 'default',
  UPCOMING: 'upcoming',
  DUE_TODAY: 'today',
  OVERDUE: 'overdue',
};

const getDueStatus = numberOfDays => {
  if (numberOfDays > 0) {
    return STATUS.UPCOMING;
  } else if (numberOfDays < 0) {
    return STATUS.OVERDUE;
  }

  return STATUS.DUE_TODAY;
};

const getDaysRemaining = () => {
  const isoDay = getISODay(new Date());
  return DUE_ISO_DAY - isoDay;
};

const getDisplayDays = days => `${Math.abs(days)} day${days > 1 ? 's' : ''}`;

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

  const isSubmitted = data.length > 0;

  const daysRemaining = getDaysRemaining();

  if (isSubmitted) {
    const totalDays = daysRemaining + 7;
    const status = getDueStatus(totalDays);

    return {
      ...query,
      data,
      reportStatus: status,
      period: currentPeriod,
      daysRemaining: totalDays,
      displayDays: getDisplayDays(totalDays),
    };
  }

  const status = getDueStatus(daysRemaining);

  return {
    ...query,
    data,
    reportStatus: status,
    period: lastPeriod,
    daysRemaining: daysRemaining,
    displayDays: getDisplayDays(daysRemaining),
  };
};
