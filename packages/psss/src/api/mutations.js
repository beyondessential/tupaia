/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { queryCache, useMutation } from 'react-query';
import { put, post } from './api';

export const useConfirmWeeklyReport = (countryCode, period) =>
  useMutation(
    () =>
      post(`confirmedWeeklyReport/${countryCode}`, {
        params: { week: period },
      }),
    {
      onSuccess: () => {
        queryCache.invalidateQueries(`weeklyReport/${countryCode}`);
        queryCache.invalidateQueries(`confirmedWeeklyReport/${countryCode}`);
        queryCache.invalidateQueries(`confirmedWeeklyReport`);
      },
    },
  );

export const useSaveWeeklyReport = ({ countryCode, siteCode, week }) => {
  const isSiteSurvey = !!siteCode;
  const weeklyReportEndpoint = isSiteSurvey
    ? `weeklyReport/${countryCode}/${siteCode}`
    : `weeklyReport/${countryCode}`;

  return useMutation(
    data =>
      put(weeklyReportEndpoint, {
        params: { week },
        data,
      }),
    {
      onSuccess: () => {
        queryCache.invalidateQueries(weeklyReportEndpoint);
        if (!isSiteSurvey) {
          queryCache.invalidateQueries(`confirmedWeeklyReport/${countryCode}`);
        }
      },
    },
  );
};
