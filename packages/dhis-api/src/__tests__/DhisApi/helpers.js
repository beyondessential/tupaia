/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisApi } from '../../DhisApi';
import { DhisFetcher } from '../../DhisFetcher';

jest.mock('../../DhisFetcher');

export const createDhisApi = ({ fetch } = {}) => {
  DhisFetcher.mockImplementation(() => {
    return {
      fetch: fetch || jest.fn(async input => input),
    };
  });
  const dhisFetcher = new DhisFetcher();
  const dhisApi = new DhisApi();
  dhisApi.fetcher = dhisFetcher;

  return dhisApi;
};
