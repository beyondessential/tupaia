/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { queryCache, useMutation } from 'react-query';
import { FakeAPI } from './singletons';

// Todo: update mutations to use psss-server api
export const useSaveSiteReport = params =>
  useMutation(data => FakeAPI.postdata(data), {
    onSuccess: () => queryCache.invalidateQueries('country-weeks', params),
  });

export const useConfirmWeeklyReport = params =>
  useMutation(data => FakeAPI.postdata(data), {
    onSuccess: () => queryCache.invalidateQueries('country-weeks', params),
  });

export const useSaveCountryReport = params =>
  useMutation(data => FakeAPI.postdata(data), {
    onSuccess: () => queryCache.invalidateQueries('country-weeks', params),
  });
