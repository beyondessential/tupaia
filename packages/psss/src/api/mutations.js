/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { queryCache, useMutation } from 'react-query';
import { saveSiteReport } from './requests';
import { put, post } from './api';
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
        queryCache.invalidateQueries(`confirmedWeeklyReport`);        
      },
    },
  );

export const useSaveCountryReport = (orgUnit, period) =>
  useMutation(
    data =>
      put(`weeklyReport/${orgUnit}`, {
        params: { week: period },
        data,
      }),
    {
      onSuccess: () => {
        queryCache.invalidateQueries(`weeklyReport/${orgUnit}`);
        queryCache.invalidateQueries(`confirmedWeeklyReport/${orgUnit}`);
      },
    },
  );
