import { Aggregator } from '@tupaia/aggregator';
import { AccessPolicy } from '@tupaia/access-policy';
import { MockTupaiaApiClient, MockEntityApi } from '@tupaia/api-client';
import { ReportBuilder } from '../reportBuilder';
import { ReqContext } from '../reportBuilder/context';
import { ReportServerAggregator } from '../aggregator';

describe('ReportBuilder', () => {
  const dataBroker = { context: {} };
  const aggregator = new Aggregator(dataBroker);
  const HIERARCHY = 'test_hierarchy';
  const ENTITIES = [
    { id: 'ouId1', code: 'AU', name: 'Australia', type: 'country', attributes: {} },
    { id: 'ouId2', code: 'FJ', name: 'Fiji', type: 'country', attributes: {} },
    { id: 'ouId3', code: 'KI', name: 'Kiribati', type: 'country', attributes: {} },
    { id: 'ouId4', code: 'TO', name: 'Tonga', type: 'country', attributes: {} },
    {
      id: 'ouId5',
      code: 'TO_Facility1',
      name: 'Tonga Facility 1',
      type: 'facility',
      attributes: { x: 1 },
    },
    {
      id: 'ouId6',
      code: 'TO_Facility2',
      name: 'Tonga Facility 2',
      type: 'facility',
      attributes: {},
    },
    { id: 'ouId7', code: 'FJ_Facility', name: 'Fiji Facility', type: 'facility', attributes: {} },
  ];

  const RELATIONS = {
    test_hierarchy: [
      { parent: 'TO', child: 'TO_Facility1' },
      { parent: 'TO', child: 'TO_Facility2' },
      { parent: 'FJ', child: 'FJ_Facility' },
    ],
  };

  const reportQuery = {
    organisationUnitCodes: ['TO'],
    hierarchy: 'explore',
    period: '2020',
    startDate: '2020-01-01',
    endDate: '2020-12-31',
  };
  const reportServerAggregator = new ReportServerAggregator(aggregator);
  const reqContext: ReqContext = {
    hierarchy: HIERARCHY,
    permissionGroup: 'Public',
    services: new MockTupaiaApiClient({
      entity: new MockEntityApi(ENTITIES, RELATIONS),
    }),
    accessPolicy: new AccessPolicy({ AU: ['Public'] }),
    query: reportQuery,
    aggregator: reportServerAggregator,
  };

  it('creates an instance', () => {
    expect(new ReportBuilder(reqContext)).toBeInstanceOf(ReportBuilder);
  });

  it('returns an error without a config being set', async () => {
    const reportBuilder = new ReportBuilder(reqContext);
    await expect(reportBuilder.build()).rejects.toThrow('Report requires a config be set');
  });

  it('returns test data if test data is provided without orgunit or hierarchy', async () => {
    const testConfig = { fetch: { dataElements: ['DE'] }, transform: [] };
    const testData = [
      { dataElement: 'TEST001', value: 4, organisationUnit: 'TO', period: '20220101' },
    ];

    const reportBuilder = new ReportBuilder(reqContext).setConfig(testConfig).setTestData(testData);
    const results = await reportBuilder.build();
    expect(results).toStrictEqual({ results: testData, type: 'default' });
  });
});
