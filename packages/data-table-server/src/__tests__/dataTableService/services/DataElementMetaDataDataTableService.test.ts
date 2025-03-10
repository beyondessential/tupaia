import { AccessPolicy } from '@tupaia/access-policy';
import { DataTableServiceBuilder } from '../../../dataTableService';

const TEST_DATA_ELEMENT_METADATA = [
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
  return TEST_DATA_ELEMENT_METADATA.filter(({ code }) => dataElementCodes.includes(code));
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
const dataElementMetaDataDataTableService = new DataTableServiceBuilder()
  .setServiceType('data_element_metadata')
  .setContext({ accessPolicy })
  .build();

describe('DataElementMetaDataDataTableService', () => {
  describe('accept no dataElementCodes', () => {
    const testData: [string, unknown][] = [['accept no dataElementCodes', {}]];

    it.each(testData)('%s', async (_, parameters: unknown) => {
      await expect(dataElementMetaDataDataTableService.fetchData(parameters)).resolves.toEqual([]);
    });
  });

  it('getParameters', () => {
    const parameters = dataElementMetaDataDataTableService.getParameters();
    expect(parameters).toEqual([
      {
        name: 'dataElementCodes',
        config: {
          type: 'dataElementCodes',
          defaultValue: [],
          innerType: {
            type: 'string',
            required: true,
          },
        },
      },
    ]);
  });

  describe('fetchData', () => {
    it('can fetch data elements metadata', async () => {
      const dataElementMetaData = await dataElementMetaDataDataTableService.fetchData({
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
