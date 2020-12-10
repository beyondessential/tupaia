/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { queryCache, useMutation } from 'react-query';
import { saveSiteReport } from './requests';
import { post } from './api';
import { FakeAPI } from './FakeApi';

export const useSaveSiteReport = params =>
  useMutation(saveSiteReport, {
    onSuccess: () => queryCache.invalidateQueries('country-weeks', params),
  });

export const useConfirmWeeklyReport = (orgUnit, period) =>
  useMutation(
    () =>
      post(`confirmedWeeklyReport/${orgUnit}`, {
        params: { week: period },
      }),
    {
      onSuccess: () => {
        queryCache.invalidateQueries(`weeklyReport/${orgUnit}`);
        queryCache.invalidateQueries(`confirmedWeeklyReport/${orgUnit}`);
      },
    },
  );

export const useSaveCountryReport = orgUnit =>
  useMutation(
    data => {
      console.log('useSaveCountryReport...', data);
      return FakeAPI.post();
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries(`weeklyReport/${orgUnit}`);
        queryCache.invalidateQueries(`confirmedWeeklyReport/${orgUnit}`);
      },
    },
  );
