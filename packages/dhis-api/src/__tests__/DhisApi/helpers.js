/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sinon from 'sinon';

import { DhisApi } from '../../DhisApi';
import { DhisFetcher } from '../../DhisFetcher';

export const createDhisApi = ({ fetch } = {}) => {
  const dhisApi = new DhisApi();
  dhisApi.fetcher = sinon.createStubInstance(DhisFetcher, {
    fetch: fetch || (async input => input),
  });

  return dhisApi;
};
