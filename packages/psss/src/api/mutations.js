/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { queryCache, useMutation } from 'react-query';
import { saveCountryReport, saveSiteReport, confirmWeeklyReport } from './endpoints';

export const useSaveSiteReport = params =>
  useMutation(saveSiteReport, {
    onSuccess: () => queryCache.invalidateQueries('country-weeks', params),
  });

export const useConfirmWeeklyReport = params =>
  useMutation(confirmWeeklyReport, {
    onSuccess: () => queryCache.invalidateQueries('country-weeks', params),
  });

export const useSaveCountryReport = params =>
  useMutation(saveCountryReport, {
    onSuccess: () => queryCache.invalidateQueries('country-weeks', params),
  });
