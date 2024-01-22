/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { when } from 'jest-when';

import { DataGroupMetadataPuller } from '../../../../services/dhis/pullers';
import { createMockDhisApi, createModelsStub } from '../DhisService.stubs';
import { DEFAULT_DATA_SERVICE_MAPPING } from '../DhisService.fixtures';

describe('DataGroupMetadataPuller', () => {
  const models = createModelsStub();
  const dataGroupMetadataPuller = new DataGroupMetadataPuller(models.dataGroup);
  const dhisApi = createMockDhisApi();

  it('uses the DhisApi to fetch data group metadata', async () => {
    const dataGroups = [{ code: 'POP01', service_type: 'dhis' as const, config: {} }];
    const dataElementCodesInGroup = ['POP01', 'POP02'];
    const includeOptions = true;
    const mockMetadata = [
      {
        code: 'POP01',
        name: 'Population Group 1',
        dataElements: [
          { code: 'POP01', name: 'Population 1' },
          { code: 'POP01', name: 'Population 2' },
        ],
      },
    ];
    when(dhisApi.fetchDataGroup)
      .calledWith('POP01', dataElementCodesInGroup, true)
      .mockResolvedValue(mockMetadata);

    const options = {
      dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
      includeOptions,
    };
    const results = await dataGroupMetadataPuller.pull(dhisApi, dataGroups, options);

    expect(results).toStrictEqual(mockMetadata);
  });
});
