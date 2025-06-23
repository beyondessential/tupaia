import { AccessPolicy } from '@tupaia/access-policy';
import { DataTableServiceBuilder } from '../../../dataTableService';

const TEST_DATA_GROUP_METADATA = [
  {
    code: 'PSSS',
    name: 'PSSS cases count',
    dataElements: [
      {
        code: 'PSSS_A',
        name: 'PSSS A cases count',
        id: 'id1',
      },
      {
        code: 'PSSS_B',
        name: 'PSSS B cases count',
        id: 'id2',
      },
      {
        code: 'PSSS_C',
        name: 'PSSS C cases count',
        id: 'id3',
      },
      {
        code: 'PSSS_D',
        name: 'PSSS D cases count',
        id: 'id4',
      },
      {
        code: 'PSSS_E',
        name: 'PSSS E cases count',
        id: 'id5',
      },
    ],
  },
];

const fetchFakeDataGroup = (dataGroupCode: string) => {
  return TEST_DATA_GROUP_METADATA.find(({ code }) => dataGroupCode === code);
};

jest.mock('@tupaia/aggregator', () => ({
  Aggregator: jest.fn().mockImplementation(() => ({
    fetchDataGroup: fetchFakeDataGroup,
  })),
}));

jest.mock('@tupaia/data-broker', () => ({
  DataBroker: jest.fn().mockImplementation(() => ({})),
}));
const accessPolicy = new AccessPolicy({ DL: ['Public'] });
const dataGroupMetaDataDataTableService = new DataTableServiceBuilder()
  .setServiceType('data_group_metadata')
  .setContext({ accessPolicy })
  .build();

describe('DataGroupMetaDataDataTableService', () => {
  describe('parameter validation', () => {
    const testData: [string, unknown, string][] = [
      ['missing dataElementCodes', {}, 'dataGroupCode is a required field'],
    ];

    it.each(testData)('%s', (_, parameters: unknown, expectedError: string) => {
      expect(() => dataGroupMetaDataDataTableService.fetchData(parameters)).toThrow(expectedError);
    });
  });

  it('getParameters', () => {
    const parameters = dataGroupMetaDataDataTableService.getParameters();
    expect(parameters).toEqual([
      {
        name: 'dataGroupCode',
        config: {
          type: 'dataGroupCode',
          required: true,
        },
      },
    ]);
  });

  describe('fetchData', () => {
    it('can fetch data group metadata', async () => {
      const dataGroupMetaData = await dataGroupMetaDataDataTableService.fetchData({
        dataGroupCode: 'PSSS',
      });

      expect(dataGroupMetaData).toEqual([
        {
          dataGroupCode: 'PSSS',
          dataGroupName: 'PSSS cases count',
          dataElementCode: 'PSSS_A',
          dataElementName: 'PSSS A cases count',
          dataElementId: 'id1',
        },
        {
          dataGroupCode: 'PSSS',
          dataGroupName: 'PSSS cases count',
          dataElementCode: 'PSSS_B',
          dataElementName: 'PSSS B cases count',
          dataElementId: 'id2',
        },
        {
          dataGroupCode: 'PSSS',
          dataGroupName: 'PSSS cases count',
          dataElementCode: 'PSSS_C',
          dataElementName: 'PSSS C cases count',
          dataElementId: 'id3',
        },
        {
          dataGroupCode: 'PSSS',
          dataGroupName: 'PSSS cases count',
          dataElementCode: 'PSSS_D',
          dataElementName: 'PSSS D cases count',
          dataElementId: 'id4',
        },
        {
          dataGroupCode: 'PSSS',
          dataGroupName: 'PSSS cases count',
          dataElementCode: 'PSSS_E',
          dataElementName: 'PSSS E cases count',
          dataElementId: 'id5',
        },
      ]);
    });
  });
});
