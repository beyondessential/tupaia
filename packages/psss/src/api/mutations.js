/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { queryCache, useMutation } from 'react-query';
import { saveCountryReport, saveSiteReport, confirmWeeklyReport } from './requests';
import { FakeAPI } from './FakeApi';

export const useSaveSiteReport = params =>
  useMutation(saveSiteReport, {
    onSuccess: () => queryCache.invalidateQueries('country-weeks', params),
  });

export const useConfirmWeeklyReport = ({ countryCode, activeWeek }) =>
  useMutation(() => console.log('post to confirmWeeklyReport...'), {
    onSuccess: () => {
      queryCache.invalidateQueries(`weeklyReport/${countryCode}`);
      queryCache.invalidateQueries(`confirmedWeeklyReport/${countryCode}`);
    },
  });

export const useSaveCountryReport = (orgUnit, period) =>
  useMutation(
    data => {
      console.log('updated report data', data);
      FakeAPI.post();
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries(`weeklyReport/${orgUnit}`, {
          startWeek: period,
          endWeek: period,
        });
        queryCache.invalidateQueries('weeklyReport/TO', {
          startWeek: '2020W49',
          endWeek: '2020W39',
        });
        queryCache.invalidateQueries('confirmedWeeklyReport/TO', {
          startWeek: '2020W49',
          endWeek: '2020W39',
        });
      },
    },
  );
