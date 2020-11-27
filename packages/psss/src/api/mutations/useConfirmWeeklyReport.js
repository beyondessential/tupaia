/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { queryCache, useMutation } from 'react-query';
import { FakeAPI } from '../singletons';

export const useConfirmWeeklyReport = params =>
  useMutation(() => FakeAPI.post(), {
    onSuccess: () => {
      queryCache.invalidateQueries('country-weeks', params);
    },
  });
