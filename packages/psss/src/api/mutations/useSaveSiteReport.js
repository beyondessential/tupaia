/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { queryCache, useMutation } from 'react-query';
import { FakeAPI } from '../index';

export const useSaveSiteReport = (fields, params) =>
  useMutation(
    () => {
      FakeAPI.post(fields);
    },
    {
      onSuccess: () => queryCache.invalidateQueries('country-weeks', params),
    },
  );
