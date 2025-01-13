import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import {
  getApiForDataSource,
  getApiFromServerName,
  getApisForDataSources,
} from '../../../services/dhis/getDhisApi';
import { DataServiceMapping } from '../../../services/DataServiceMapping';

const TEST_DHIS_INSTANCE = {
  code: 'test_dhis_instance',
  config: {
    devUrl: 'https://example.com',
  },
};

const TEST_DHIS_INSTANCES = [TEST_DHIS_INSTANCE];

const TEST_DATA_SOURCE_1 = {
  code: 'TEST_DATA_SOURCE_1',
  service_type: 'dhis',
  config: {
    dhisInstanceCode: 'test_dhis_instance',
  },
} as const;

const TEST_DATA_SOURCE_2 = {
  code: 'TEST_DATA_SOURCE_2',
  service_type: 'dhis',
  config: {
    dhisInstanceCode: 'test_dhis_instance',
  },
} as const;

const DATA_SOURCES = [TEST_DATA_SOURCE_1, TEST_DATA_SOURCE_2];

const DEFAULT_DATA_SERVICE_MAPPING = new DataServiceMapping(
  Object.values(DATA_SOURCES).map(de => ({
    dataSource: de,
    service_type: de.service_type,
    config: de.config,
  })),
  [],
);

const mockModels = baseCreateModelsStub({
  dhisInstance: {
    records: TEST_DHIS_INSTANCES,
  },
});

describe('getDhisApi', () => {
  describe('getApiForDataSource()', () => {
    it('resolves', async () => {
      const api = await getApiForDataSource(
        mockModels,
        TEST_DATA_SOURCE_1,
        DEFAULT_DATA_SERVICE_MAPPING,
      );
      expect(api.getServerName()).toBe('test_dhis_instance');
    });
  });

  describe('getApisForDataSources()', () => {
    it('resolves', async () => {
      const apis = await getApisForDataSources(
        mockModels,
        [TEST_DATA_SOURCE_1],
        DEFAULT_DATA_SERVICE_MAPPING,
      );
      expect(apis.length).toBe(1);
      expect(apis[0].getServerName()).toBe('test_dhis_instance');
    });

    it('only returns unique apis', async () => {
      // (See RN-104)
      // This should not be possible due to unique constraint on code (serverName)
      // but we test for it regardless to be safe.
      const apis = await getApisForDataSources(
        mockModels,
        [TEST_DATA_SOURCE_1, TEST_DATA_SOURCE_2],
        DEFAULT_DATA_SERVICE_MAPPING,
      );
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
