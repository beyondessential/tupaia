/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { MockEntityApi, MockTupaiaApiClient } from '@tupaia/api-client';
import { ReqContext } from '../../../reportBuilder/context';
import { palauNursingSurgicalWardReport } from '../../../reportBuilder/customReports/palauNursingSurgicalWardReport';

const mockDhisRecords = {
  organisationUnits: [{ id: 'ORG1', code: 'PW_Facility', name: 'Palau Facility 1' }],
  categoryOptionCombos: [{ id: 'CAT1', code: 'TEST_CAT', name: 'Test Category Combo' }],
  dataElements: [
    { id: 'DE1', code: 'PW_SW01SurveyDate', name: 'Date of report' },
    { id: 'DE2', code: 'PW_SW01_5_PW_SW01_6', name: 'Regular admissions' },
  ],
};

const mockDataValues = [
  {
    organisationUnit: 'ORG1',
    dataElement: 'DE1',
    period: '20220611',
    orgUnit: 'ORG1',
    categoryOptionCombo: 'CAT1',
    attributeOptionCombo: 'HllvX50cXC0',
    value: '2022-01-31',
    storedBy: 'Superman',
    created: '2022-06-11T04:57:49.000+0000',
    lastUpdated: '2022-06-11T04:57:49.000+0000',
    followup: false,
  },
  {
    organisationUnit: 'ORG1',
    dataElement: 'DE2',
    period: '20220611',
    orgUnit: 'ORG1',
    categoryOptionCombo: 'CAT1',
    attributeOptionCombo: 'HllvX50cXC0',
    value: '5',
    storedBy: 'Superman',
    created: '2022-06-11T04:57:49.000+0000',
    lastUpdated: '2022-06-11T04:57:49.000+0000',
    followup: false,
  },
];

jest.mock('@tupaia/dhis-api', () => {
  return {
    DhisApi: jest.fn().mockImplementation(() => {
      return {
        getDataValuesInSets: jest.fn().mockResolvedValue(mockDataValues),
        getResourceTypes: jest.fn().mockReturnValue({
          DATA_ELEMENT: 'dataElements',
          ORGANISATION_UNIT: 'organisationUnits',
          CATEGORY_OPTION_COMBO: 'categoryOptionCombos',
        }),
        getRecords: jest.fn(({ type, ids, fields }) => {
          const recordsOfType = mockDhisRecords[type as keyof typeof mockDhisRecords];
          const records: Record<string, string>[] = [];
          ids.forEach((id: string) => {
            const matchingRecord = recordsOfType.find(
              (record: Record<string, string>) => record.id === id,
            );
            if (matchingRecord) {
              records.push(matchingRecord);
            }
          });
          const recordsWithRequestedFields = records.map(record => {
            const recordWithRequestedFields = { ...record };
            Object.keys(recordWithRequestedFields)
              .filter(key => !fields.includes(key))
              .forEach(key => delete recordWithRequestedFields[key]);
            return recordWithRequestedFields;
          });
          return recordsWithRequestedFields;
        }),
      };
    }),
  };
});

jest.mock(
  '../../../reportBuilder/customReports/data/palauNursingSurveyMetadata.json',
  () => ({
    PW_SW01: {
      codesUsingCategories: ['TEST_CAT'],
      codesToName: {
        PW_SW01SurveyDate: 'Date of report',
        PW_SW01_5_PW_SW01_6: 'Regular admissions',
      },
    },
  }),
  { virtual: true },
);

describe('palauNursingSurgicalWardReport', () => {
  afterEach(jest.clearAllMocks);

  const HIERARCHY = 'test_hierarchy';
  const ENTITIES = [
    { code: 'PW', name: 'Palau', type: 'country' },
    { code: 'PW_Facility', name: 'Palau Facility 1', type: 'facility' },
    { code: 'TO', name: 'Tonga', type: 'country' },
    {
      code: 'TO_District',
      name: 'Tonga District',
      type: 'district',
    },
    {
      code: 'TO_Facility1',
      name: 'Tonga Facility 1',
      type: 'facility',
    },
    {
      code: 'TO_Facility2',
      name: 'Tonga Facility 2',
      type: 'facility',
    },
  ];

  const RELATIONS = {
    test_hierarchy: [
      { parent: 'TO', child: 'TO_District' },
      { parent: 'TO_District', child: 'TO_Facility1' },
      { parent: 'TO_District', child: 'TO_Facility2' },
      { parent: 'PW', child: 'PW_Facility' },
    ],
  };

  const reqContext: ReqContext = {
    hierarchy: HIERARCHY,
    permissionGroup: 'Public',
    services: new MockTupaiaApiClient({
      entity: new MockEntityApi(ENTITIES, RELATIONS),
    }),
    accessPolicy: new AccessPolicy({ AU: ['Public'] }),
  };

  it('returns rows and columns', async () => {
    const results = await palauNursingSurgicalWardReport(reqContext, {
      organisationUnitCodes: ['PW'],
      hierarchy: 'test_hierarchy',
    });

    expect(Object.keys(results)).toEqual(expect.arrayContaining(['columns', 'rows']));
  });

  it('returns data', async () => {
    const expectedResults = {
      columns: [
        { key: 'Date of report', title: 'Date of report' },
        { key: 'Regular admissions', title: 'Regular admissions' },
      ],
      rows: [
        {
          'Date of report': '2022-01-31',
          'Facility code': 'PW_Facility',
          'Facility name': 'Palau Facility 1',
          period: '20220611',
          'Regular admissions': '5',
        },
      ],
    };

    const results = await palauNursingSurgicalWardReport(reqContext, {
      organisationUnitCodes: ['PW'],
      hierarchy: 'test_hierarchy',
    });

    expect(results).toMatchObject(expectedResults);
  });
});
