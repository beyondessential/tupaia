/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { AccessPolicy } from '@tupaia/access-policy';
import { DataTableServiceBuilder } from '../../../dataTableService';

const TEST_DATA_ELEMENTS_METADATA = [
  {
    code: 'PSSS_A',
    name: 'PSSS A cases count',
  },
  {
    code: 'PSSS_B',
    name: 'PSSS B cases count',
  },
  {
    code: 'PSSS_C',
    name: 'PSSS C cases count',
  },
  {
    code: 'PSSS_D',
    name: 'PSSS D cases count',
  },
  {
    code: 'PSSS_E',
    name: 'PSSS E cases count',
  },
];

const fetchFakeDataElements = (dataElementCodes: string[]) => {
  return TEST_DATA_ELEMENTS_METADATA.filter(({ code }) => dataElementCodes.includes(code));
};

jest.mock('@tupaia/aggregator', () => ({
  Aggregator: jest.fn().mockImplementation(() => ({
    fetchDataElements: fetchFakeDataElements,
  })),
}));

jest.mock('@tupaia/data-broker', () => ({
  DataBroker: jest.fn().mockImplementation(() => ({})),
}));
const accessPolicy = new AccessPolicy({ DL: ['Public'] });
const dataElementsMetaDataDataTableService = new DataTableServiceBuilder()
  .setServiceType('data_elements_metadata')
  .setContext({ accessPolicy })
  .build();

describe('DataElementsMetaDataDataTableService', () => {
  describe('parameter validation', () => {
    const testData: [string, unknown, string][] = [
      ['missing dataElementCodes', {}, 'dataElementCodes is a required field'],
    ];

    it.each(testData)('%s', (_, parameters: unknown, expectedError: string) => {
      expect(() => dataElementsMetaDataDataTableService.fetchData(parameters)).toThrow(
        expectedError,
      );
    });
  });

  it('getParameters', () => {
    const parameters = dataElementsMetaDataDataTableService.getParameters();
    expect(parameters).toEqual([
      {
        name: 'dataElementCodes',
        config: {
          type: 'array',
          innerType: {
            type: 'string',
            required: true,
          },
          required: true,
        },
      },
    ]);
  });

  describe('fetchData', () => {
    it('can fetch data elements metadata', async () => {
      const dataElementMetaData = await dataElementsMetaDataDataTableService.fetchData({
        dataElementCodes: ['PSSS_A', 'PSSS_B'],
      });

      expect(dataElementMetaData).toEqual([
        {
          code: 'PSSS_A',
          name: 'PSSS A cases count',
        },
        {
          code: 'PSSS_B',
          name: 'PSSS B cases count',
        },
      ]);
    });
  });
});
