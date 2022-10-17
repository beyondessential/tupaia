/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { actualMonthlyValuesVsIdeal } from '/apiV1/dataBuilders/generic/comparison/actualMonthlyValuesVsIdeal';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

const dataBuilderConfig = {
  pairs: {
    FIJIINV014: 'ANZIDEAL009',
    FIJIINV047: 'ANZIDEAL032',
    FIJIINV029: 'ANZIDEAL020',
    FIJIINV011: 'ANZIDEAL099',
    FIJIINV023: 'ANZIDEAL000',
  },
  includeAverage: true,
  fillEmptyDenominatorValues: false,
  labelRegex: '(?<=Endoscopy inventory: )(.*)(?= \\(Ideal inventory\\))',
};

const actualResults = [
  {
    dataElement: 'FIJIINV014',
    organisationUnit: 'TO_VHP',
    period: 20131113,
    value: 80,
  },
  {
    dataElement: 'FIJIINV047',
    organisationUnit: 'TO_VHP',
    period: 20181113,
    value: 300,
  },
  {
    dataElement: 'FIJIINV014',
    organisationUnit: 'TO_VHP',
    period: 20181113,
    value: 40,
  },
  {
    dataElement: 'FIJIINV029',
    organisationUnit: 'TO_VHP',
    period: 20181113,
    value: 5,
  },
  {
    dataElement: 'FIJIINV029',
    organisationUnit: 'TO_VHP',
    period: 20181113,
    value: 5,
  },
  {
    dataElement: 'FIJIINV011',
    organisationUnit: 'TO_VHP',
    period: 20181113,
    value: 999,
  },
  // use last year
  {
    dataElement: 'FIJIINV047',
    organisationUnit: 'TO_VHP',
    period: 20171113,
    value: 300,
  },
  {
    dataElement: 'FIJIINV014',
    organisationUnit: 'TO_VHP',
    period: 20171113,
    value: 80,
  },
  {
    dataElement: 'FIJIINV029',
    organisationUnit: 'TO_VHP',
    period: 20171113,
    value: 12,
  },
  {
    dataElement: 'FIJIINV029',
    organisationUnit: 'TO_VHP',
    period: 20171113,
    value: 2,
  },
  {
    dataElement: 'FIJIINV011',
    organisationUnit: 'TO_VHP',
    period: 20171113,
    value: 200,
  },
];

const actualMetadata = {
  dataElementCodeToName: {
    FIJIINV014: 'Endoscopy inventory: Sclerotherapy needle (Actual inventory)',
    FIJIINV047: 'Endoscopy inventory: PEG tubes (Actual inventory)',
    FIJIINV029: 'Endoscopy inventory: Oesophageal stent (Actual inventory)',
    FIJIINV011: 'Endoscopy inventory: Haemoclips (Actual inventory)',
    FIJIINV023: 'Endoscopy inventory: Balloon dilators (Actual inventory)',
  },
};

const idealResults = [
  {
    dataElement: 'ANZIDEAL032',
    organisationUnit: 'TO_VHP',
    period: 20181113,
    value: 30,
  },
  {
    dataElement: 'ANZIDEAL009',
    organisationUnit: 'TO_VHP',
    period: 20181113,
    value: 400,
  },
  {
    dataElement: 'Arr04LSf5kR',
    organisationUnit: 'TO_VHP',
    period: 20181113,
    value: 10,
  },
  {
    dataElement: 'ANZIDEAL000',
    organisationUnit: 'TO_VHP',
    period: 20181113,
    value: 10,
  },
];

const idealMetadata = {
  dataElementCodeToName: {
    ANZIDEAL009: 'Endoscopy inventory: Sclerotherapy needle (Ideal inventory)',
    ANZIDEAL032: 'Endoscopy inventory: PEG tubes (Ideal inventory)',
    ANZIDEAL020: 'Endoscopy inventory: Oesophageal stent (Ideal inventory)',
    ANZIDEAL099: 'Endoscopy inventory: Haemoclips (Ideal inventory)',
    ANZIDEAL000: 'Endoscopy inventory: Balloon dilators (Ideal inventory)',
  },
};

const query = {
  viewId: 'TO_VHP_Descriptive_Consumables',
  dashboardGroupId: '26',
  organisationUnitCode: 'TO_VHP',
  period: null,
};

const aggregatorMockup = {
  fetchAnalytics: async dataElementCodes =>
    dataElementCodes.includes('FIJIINV011')
      ? { results: actualResults, metadata: actualMetadata }
      : { results: idealResults, metadata: idealMetadata },
  aggregationTypes: { FINAL_EACH_MONTH: 'FINAL_EACH_MONTH' },
};
const dhisApiMockup = {};

describe('actualMonthlyValuesVsIdeal', () => {
  it('should have dates in desc order', async () => {
    const result = await actualMonthlyValuesVsIdeal(
      {
        dataBuilderConfig,
        query,
      },
      aggregatorMockup,
      dhisApiMockup,
    );
    const keys = result.columns.map(({ key }) => key);
    expect(keys).toStrictEqual(['ideal', 20181113, 20171113, 20131113]);
  });

  it('should have Sclerotherapy needle be 80 for 20131113', async () => {
    const result = await actualMonthlyValuesVsIdeal(
      {
        dataBuilderConfig,
        query,
      },
      aggregatorMockup,
      dhisApiMockup,
    );
    expect(result.rows[0]['20131113']).toBe(80);
  });

  it("should have balloon dilators be 'No data' for 20131113", async () => {
    const result = await actualMonthlyValuesVsIdeal(
      {
        dataBuilderConfig,
        query,
      },
      aggregatorMockup,
      dhisApiMockup,
    );
    expect(result.rows.find(row => row.dataElement === 'Balloon dilators')['20131113']).toBe(
      NO_DATA_AVAILABLE,
    );
  });
});
