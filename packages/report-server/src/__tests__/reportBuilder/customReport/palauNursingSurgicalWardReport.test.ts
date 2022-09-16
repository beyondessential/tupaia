/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { ReqContext } from '../../../reportBuilder/context';
import { palauNursingSurgicalWardReport } from '../../../reportBuilder/customReports/palauNursingSurgicalWardReport';
import { entityApiMock } from '../testUtils';

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
    period: '20220131',
    orgUnit: 'ORG1',
    categoryOptionCombo: 'CAT1',
    attributeOptionCombo: 'HllvX50cXC0',
    value: '5',
    storedBy: 'Superman',
    created: '2022-06-11T04:57:49.000+0000',
    lastUpdated: '2022-06-11T04:57:49.000+0000',
    followup: false,
  },
  {
    organisationUnit: 'ORG1',
    dataElement: 'DE2',
    period: '20220131',
    orgUnit: 'ORG1',
    categoryOptionCombo: 'CAT1',
    attributeOptionCombo: 'HllvX50cXC0',
    value: '2022-01-31',
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

describe('palauNursingSurgicalWardReport', () => {
  afterEach(jest.clearAllMocks);

  const HIERARCHY = 'test_hierarchy';
  const ENTITIES = {
    test_hierarchy: [
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
    ],
  };

  const RELATIONS = {
    test_hierarchy: [
      { parent: 'TO', child: 'TO_District' },
      { parent: 'TO_District', child: 'TO_Facility1' },
      { parent: 'TO_District', child: 'TO_Facility2' },
      { parent: 'PW', child: 'PW_Facility' },
    ],
  };

  const apiMock = entityApiMock(ENTITIES, RELATIONS);

  const reqContext: ReqContext = {
    hierarchy: HIERARCHY,
    permissionGroup: 'Public',
    services: {
      entity: apiMock,
    } as ReqContext['services'],
    accessPolicy: new AccessPolicy({ AU: ['Public'] }),
  };

  it('does something', async () => {
    const results = await palauNursingSurgicalWardReport(reqContext, {
      organisationUnitCodes: ['PW'],
      hierarchy: 'test_hierarchy',
    });

    expect(Object.keys(results)).toEqual(expect.arrayContaining(['columns', 'rows']));
  });
});
