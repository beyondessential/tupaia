/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { queryCache, useMutation } from 'react-query';
import { saveSiteReport } from './requests';
import { FakeAPI } from './FakeApi';

export const useSaveSiteReport = params =>
  useMutation(saveSiteReport, {
    onSuccess: () => queryCache.invalidateQueries('country-weeks', params),
  });

export const useConfirmWeeklyReport = countryCode =>
  useMutation(() => console.log('post to confirmWeeklyReport...'), {
    onSuccess: () => {
      queryCache.invalidateQueries(`weeklyReport/${countryCode}`);
      queryCache.invalidateQueries(`confirmedWeeklyReport/${countryCode}`);
    },
  });

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
