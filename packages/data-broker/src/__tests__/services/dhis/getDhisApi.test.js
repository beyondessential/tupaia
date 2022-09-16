/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  getApiForDataSource,
  getApiFromServerName,
  getApisForDataSources,
} from '../../../services/dhis/getDhisApi';

const TEST_DHIS_INSTANCE = {
  code: 'test_dhis_instance',
  config: {
    devUrl: 'https://example.com',
  },
};

const TEST_DHIS_INSTANCES = [TEST_DHIS_INSTANCE];

const TEST_DATA_SOURCE_1 = {
  code: 'TEST_DATA_SOURCE_1',
  serviceType: 'dhis',
  config: {
    dhisInstanceCode: 'test_dhis_instance',
  },
};

const TEST_DATA_SOURCE_2 = {
  code: 'TEST_DATA_SOURCE_2',
  serviceType: 'dhis',
  config: {
    dhisInstanceCode: 'test_dhis_instance',
  },
};

const mockModels = {
  dhisInstance: {
    find: async () => TEST_DHIS_INSTANCES,
    findOne: async ({ code }) => TEST_DHIS_INSTANCES.find(instance => instance.code === code),
  },
};

describe('getDhisApi', () => {
  describe('getApiForDataSource()', () => {
    it('resolves', async () => {
      const api = await getApiForDataSource(mockModels, TEST_DATA_SOURCE_1);
      expect(api.getServerName()).toBe('test_dhis_instance');
    });
  });

  describe('getApisForDataSources()', () => {
    it('resolves', async () => {
      const apis = await getApisForDataSources(mockModels, [TEST_DATA_SOURCE_1]);
      expect(apis.length).toBe(1);
      expect(apis[0].getServerName()).toBe('test_dhis_instance');
    });

    it('only returns unique apis', async () => {
      // (See RN-104)
      // This should not be possible due to unique constraint on code (serverName)
      // but we test for it regardless to be safe.
      const apis = await getApisForDataSources(mockModels, [
        TEST_DATA_SOURCE_1,
        TEST_DATA_SOURCE_2,
      ]);
      expect(apis.length).toBe(1);
    });
  });

  describe('getApiFromServerName()', () => {
    it('resolves', async () => {
      const api = await getApiFromServerName(mockModels, 'test_dhis_instance');
      expect(api.getServerName()).toBe('test_dhis_instance');
    });

    it('throws if instance does not exist with given serverName', async () => {
      return expect(
        getApiFromServerName(mockModels, 'SOME_SERVER_NAME_THAT_DOESNT_EXIST'),
      ).toBeRejectedWith('Could not find DHIS Instance with serverName');
    });
  });
});
