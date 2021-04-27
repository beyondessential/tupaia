/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { queryCache, useMutation } from 'react-query';
import { remove, put, post } from './api';

export const useConfirmWeeklyReport = (countryCode, period) =>
  useMutation(
    () =>
      post(`confirmedWeeklyReport/${countryCode}`, {
        params: { week: period },
      }),
    {
      onSuccess: () => {
        queryCache.invalidateQueries(`confirmedWeeklyReport/${countryCode}`);
        // regional (multi-country) level
        queryCache.invalidateQueries('confirmedWeeklyReport', { exact: true });
      },
    },
  );

export const useSaveWeeklyReport = ({ countryCode, siteCode = '', week }) =>
  useMutation(
    data =>
      put(`weeklyReport/${countryCode}/${siteCode}`, {
        params: { week },
        data,
      }),
    {
      onSuccess: () => {
        queryCache.invalidateQueries(`weeklyReport/${countryCode}/${siteCode}`);
        queryCache.invalidateQueries(`weeklyReport/${countryCode}`, { exact: true });
      },
    },
  );

export const useDeleteWeeklyReport = ({ countryCode, week }) =>
  useMutation(
    () =>
      remove(`weeklyReport/${countryCode}`, {
        params: { week },
      }),
    {
      onSuccess: () => {
        queryCache.invalidateQueries(`weeklyReport/${countryCode}`);
      },
    },
  );

export const combineMutationResults = results => ({
  isError: !!results.find(r => r.isError),
  error: results.find(r => r.error)?.error ?? null,
});
