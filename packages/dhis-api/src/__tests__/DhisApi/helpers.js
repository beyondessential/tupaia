import { createJestMockInstance } from '@tupaia/utils';
import { DhisApi } from '../../DhisApi';

export const createDhisApi = ({ fetch } = {}) => {
  const dhisApi = new DhisApi();
  dhisApi.fetcher = createJestMockInstance('@tupaia/dhis-api/src/DhisFetcher', 'DhisFetcher', {
    fetch: fetch || jest.fn(async input => input),
  });

  return dhisApi;
};
