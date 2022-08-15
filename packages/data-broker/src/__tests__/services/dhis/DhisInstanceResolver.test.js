/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { legacy_getDhisServerName } from '@tupaia/utils';
import { DhisInstanceResolver } from '../../../services/dhis/DhisInstanceResolver';

jest.mock('@tupaia/utils');

const TEST_DHIS_INSTANCES = [
  {
    code: 'test_dhis_instance_1',
    config: {},
  },
  {
    code: 'test_dhis_instance_2',
    config: {},
  },
];

const DATA_SOURCE_1_DHIS_NON_EXISTENT = 'test_data_source_non_existent';
const DATA_SOURCE_2 = 'test_dhis_instance_1';

const mockModels = {
  dhisInstance: {
    find: async () => TEST_DHIS_INSTANCES,
    findOne: async ({ code }) => TEST_DHIS_INSTANCES.find(instance => instance.code === code),
  },
};

describe('DhisInstanceResolver', () => {
  let resolver;

  beforeAll(() => {
    resolver = new DhisInstanceResolver(mockModels);
  });

  it('throws if given nothing', async () => {
    return expect(resolver.get({ dataSourceDhisInstanceCode: null })).toBeRejectedWith(
      'No DHIS Instance specified on dataSource, and entityBasedDhisResolution not used',
    );
  });

  it('throws if given a data source which links to a non-existent dhis instance', async () => {
    return expect(
      resolver.get({ dataSourceDhisInstanceCode: DATA_SOURCE_1_DHIS_NON_EXISTENT }),
    ).toBeRejectedWith('No DHIS Instance found with code');
  });

  it('resolves trivially when data source specifies a dhis instance', async () => {
    const instance = await resolver.get({ dataSourceDhisInstanceCode: DATA_SOURCE_2 });
    return expect(instance.code).toBe('test_dhis_instance_1');
  });

  describe('entity based resolution', () => {
    beforeEach(() => {
      legacy_getDhisServerName.mockReset();
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('single entity code', async () => {
      legacy_getDhisServerName.mockReturnValueOnce('test_dhis_instance_2');
      await resolver.get({
        dataSourceDhisInstanceCode: undefined,
        entityCodes: ['TO'],
      });
      return expect(legacy_getDhisServerName).toBeCalledWith({
        entityCode: 'TO',
        isDataRegional: false,
      });
    });

    it('multiple entity codes', async () => {
      legacy_getDhisServerName.mockReturnValue('test_dhis_instance_2');
      await resolver.get({
        dataSourceDhisInstanceCode: undefined,
        entityCodes: ['TO', 'LA'],
      });
      return expect(legacy_getDhisServerName.mock.calls).toEqual([
        [
          {
            entityCode: 'TO',
            isDataRegional: false,
          },
        ],
        [
          {
            entityCode: 'LA',
            isDataRegional: false,
          },
        ],
      ]);
    });

    it('throws if it cannot resolve multiple entities to a single DHIS server', async () => {
      legacy_getDhisServerName
        .mockReturnValueOnce('test_dhis_instance_1')
        .mockReturnValueOnce('test_dhis_instance_2');
      return expect(
        resolver.get({
          dataSourceDhisInstanceCode: undefined,
          entityCodes: ['TO', 'LA'],
        }),
      ).toBeRejectedWith('All entities must use the same DHIS2 instance');
    });
  });
});
