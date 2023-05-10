/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useQueryClient, useMutation } from 'react-query';
import { remove, put, post } from './api';

export const useConfirmWeeklyReport = (countryCode, period) =>
  useMutation(
    () =>
      post(`confirmedWeeklyReport/${countryCode}`, {
        params: { week: period },
      }),
    {
      onSuccess: response => {
        // Same as useSaveWeeklyReport, we need to invalidate all weekly data
        useQueryClient().invalidateQueries(`confirmedWeeklyReport/${countryCode}`);
        // regional (multi-country) level
        useQueryClient().invalidateQueries('confirmedWeeklyReport', { exact: true });

        if (response?.alertData?.createdAlerts?.length > 0) {
          useQueryClient().invalidateQueries(`alerts/active`);
        }
        if (response?.alertData?.alertsArchived) {
          useQueryClient().invalidateQueries(`alerts/archive`);
        }
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
        useQueryClient().invalidateQueries(`weeklyReport/${countryCode}/sites`);
        // Even though we only changed one week of data, we need to re-fetch the complete list because
        // the data for a specific week is dependant on previous weeks, even across pages.
        useQueryClient().invalidateQueries(`weeklyReport/${countryCode}`);
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
        // Same as useSaveWeeklyReport, we need to invalidate all weekly data
        useQueryClient().invalidateQueries(`weeklyReport/${countryCode}`);
      },
    },
  );

export const combineMutationResults = results => ({
  isError: !!results.find(r => r.isError),
  error: results.find(r => r.error)?.error ?? null,
});
