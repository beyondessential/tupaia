/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { when } from 'jest-when';

import { createJestMockInstance } from '@tupaia/utils';
import { DataElementsMetadataPuller } from '../../../../services/dhis/pullers';
import { createMockDhisApi, createModelsStub } from '../DhisService.stubs';
import { DEFAULT_DATA_SERVICE_MAPPING, DHIS_RESPONSE_DATA_ELEMENTS } from '../DhisService.fixtures';
import { DhisMetadataObject } from '../../../../types';
import { DhisTranslator } from '../../../../services/dhis/translators';

describe('DataElementsMetadataPuller', () => {
  const models = createModelsStub();
  const dhisTranslator: DhisTranslator = createJestMockInstance(
    '@tupaia/data-broker/src/services/dhis/translators/DhisTranslator',
    'DhisTranslator',
    {
      translateInboundDataElements: jest.fn(),
      translateInboundIndicators: (metadata: DhisMetadataObject[]) => metadata,
    },
  );
  const dataElementsMetadataPuller = new DataElementsMetadataPuller(
    models.dataElement,
    dhisTranslator,
  );
  const dhisApi = createMockDhisApi();

  beforeAll(() => {
    when(dhisApi.fetchCategoryOptionCombos).defaultResolvedValue([]);
  });

  describe('DHIS data type: DataElement', () => {
    it('uses the DhisApi to fetch metadata', async () => {
      const dataElements = [
        {
          code: 'POP01',
          service_type: 'dhis' as const,
          permission_groups: [],
          dataElementCode: 'POP01',
          config: {},
        },
        {
          code: 'POP02',
          service_type: 'dhis' as const,
          permission_groups: [],
          dataElementCode: 'POP02',
          config: {},
        },
      ];
      const dhisDataElements = [
        DHIS_RESPONSE_DATA_ELEMENTS.POP01,
        DHIS_RESPONSE_DATA_ELEMENTS.POP02,
      ];
      const additionalFields = ['valueType'];
      const includeOptions = true;
      when(dhisApi.fetchDataElements)
        .calledWith(['POP01', 'POP02'], {
          additionalFields,
          includeOptions,
        })
        .mockResolvedValue(dhisDataElements);
      when(dhisTranslator.translateInboundDataElements)
        .calledWith(dhisDataElements, [], dataElements)
        .mockReturnValue(dhisDataElements);

      const options = {
        dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
        additionalFields,
        includeOptions,
      };
      const results = await dataElementsMetadataPuller.pull(dhisApi, dataElements, options);

      expect(results).toStrictEqual(dhisDataElements);
    });

    it('includes category options combos if they are specified in the data element records', async () => {
      const dataElements = [
        {
          code: 'POP01',
          service_type: 'dhis' as const,
          permission_groups: [],
          dataElementCode: 'POP01',
          config: {
            categoryOptionCombo: 'Combo1',
          },
        },
        {
          code: 'POP02',
          service_type: 'dhis' as const,
          permission_groups: [],
          dataElementCode: 'POP02',
          config: {
            categoryOptionCombo: 'Combo2',
          },
        },
      ];
      const dhisDataElements = [
        DHIS_RESPONSE_DATA_ELEMENTS.POP01,
        DHIS_RESPONSE_DATA_ELEMENTS.POP02,
      ];
      const mockCategoryOptionCombos = [
        { id: 'coc1', code: 'Combo1', name: 'Combo 1' },
        { id: 'coc2', code: 'Combo2', name: 'Combo 2' },
      ];
      when(dhisApi.fetchDataElements)
        .calledWith(['POP01', 'POP02'], {
          additionalFields: undefined,
          includeOptions: undefined,
        })
        .mockResolvedValue(dhisDataElements);
      when(dhisApi.fetchCategoryOptionCombos)
        .calledWith(['Combo1', 'Combo2'])
        .mockResolvedValue(mockCategoryOptionCombos);
      when(dhisTranslator.translateInboundDataElements)
        .calledWith(dhisDataElements, mockCategoryOptionCombos, dataElements)
        .mockReturnValue(dhisDataElements);

      const options = {
        dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
      };
      const results = await dataElementsMetadataPuller.pull(dhisApi, dataElements, options);

      expect(results).toStrictEqual(dhisDataElements);
    });
  });

  describe('DHIS data type: Indicator', () => {
    it('uses the DhisApi to fetch metadata', async () => {
      const dataElements = [
        {
          code: 'INDICATOR_1',
          service_type: 'dhis' as const,
          permission_groups: [],
          dataElementCode: 'INDICATOR_1',
          config: {
            dhisDataType: 'Indicator',
          } as const,
        },
        {
          code: 'INDICATOR_2',
          service_type: 'dhis' as const,
          permission_groups: [],
          dataElementCode: 'INDICATOR_2',
          config: {
            dhisDataType: 'Indicator',
          } as const,
        },
      ];
      const dhisIndicator = [
        { code: 'INDICATOR_1', name: 'Indicator 1' },
        { code: 'INDICATOR_2', name: 'Indicator 2' },
      ];
      when(dhisApi.fetchIndicators)
        .calledWith({ dataElementCodes: ['INDICATOR_1', 'INDICATOR_2'] })
        .mockResolvedValue(dhisIndicator);

      const options = {
        dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
      };
      const results = await dataElementsMetadataPuller.pull(dhisApi, dataElements, options);

      expect(results).toStrictEqual(dhisIndicator);
    });
  });

  it('can fetch metadata belonging to different data types in the same request', async () => {
    const dataElement = {
      code: 'POP01',
      service_type: 'dhis' as const,
      permission_groups: [],
      dataElementCode: 'POP01',
      config: {
        dhisDataType: 'DataElement',
      } as const,
    };
    const indicator = {
      code: 'INDICATOR_1',
      service_type: 'dhis' as const,
      permission_groups: [],
      dataElementCode: 'INDICATOR_1',
      config: {
        dhisDataType: 'Indicator',
      } as const,
    };
    const dhisDataElements = [DHIS_RESPONSE_DATA_ELEMENTS.POP01];
    const dhisIndicator = { code: 'INDICATOR_1', name: 'Indicator 1' };
    when(dhisApi.fetchIndicators)
      .calledWith({ dataElementCodes: ['INDICATOR_1'] })
      .mockResolvedValue([dhisIndicator]);
    when(dhisApi.fetchDataElements)
      .calledWith(['POP01'], {
        additionalFields: undefined,
        includeOptions: undefined,
      })
      .mockResolvedValue(dhisDataElements);
    when(dhisTranslator.translateInboundDataElements)
      .calledWith(dhisDataElements, [], [dataElement])
      .mockReturnValue(dhisDataElements);

    const options = {
      dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
    };
    const results = await dataElementsMetadataPuller.pull(
      dhisApi,
      [dataElement, indicator],
      options,
    );

    const expected = [
      DHIS_RESPONSE_DATA_ELEMENTS.POP01,
      {
        code: 'INDICATOR_1',
        name: 'Indicator 1',
      },
    ];
    expect(results).toStrictEqual(expected);
  });
});
