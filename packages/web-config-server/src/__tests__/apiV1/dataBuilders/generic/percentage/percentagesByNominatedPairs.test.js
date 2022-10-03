/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { percentagesByNominatedPairs } from '/apiV1/dataBuilders/generic/percentage/percentagesByNominatedPairs';

const dataBuilderConfig = {
  pairs: {
    FIJIINV014: 'ANZIDEAL009',
    FIJIINV047: 'ANZIDEAL032',
    FIJIINV029: 'ANZIDEAL020',
    FIJIINV011: 'ANZIDEAL099',
    FIJIINV023: 'ANZIDEAL000',
  },
  includeAggregateLine: true,
  fillEmptyDenominatorValues: false,
  numeratorDataElementGroupCode: 'ANZGITA_Actual_Inventory',
  denominatorDataElementGroupCode: 'ANZGITA_Ideal_Inventory',
  numeratorLabelRegex: '(?<=Endoscopy inventory: )(.*)(?= \\(Actual inventory\\))',
  aggregationTypes: {
    numerator: 'MOST_RECENT',
    denominator: 'MOST_RECENT',
  },
};

const numeratorResults = [
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
];

const numeratorMetadata = {
  dataElementCodeToName: {
    FIJIINV014: 'Endoscopy inventory: Sclerotherapy needle (Actual inventory)',
    FIJIINV047: 'Endoscopy inventory: PEG tubes (Actual inventory)',
    FIJIINV029: 'Endoscopy inventory: Oesophageal stent (Actual inventory)',
    FIJIINV011: 'Endoscopy inventory: Haemoclips (Actual inventory)',
    FIJIINV023: 'Endoscopy inventory: Balloon dilators (Actual inventory)',
  },
};

const denominatorResults = [
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
    dataElement: 'ANZIDEAL020',
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

const denominatorMetadata = {
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
      ? { results: numeratorResults, metadata: numeratorMetadata }
      : { results: denominatorResults, metadata: denominatorMetadata },
};
const dhisApiMockup = {};

describe('percentagesByNominatedPairs', () => {
  let data;
  let aggregate;

  beforeAll(async () => {
    const response = await percentagesByNominatedPairs(
      {
        dataBuilderConfig,
        query,
      },
      aggregatorMockup,
      dhisApiMockup,
    );
    data = response.data;
    aggregate = response.aggregate;
  });

  it('should have PEG tubes 10 times the ideal level', () => {
    expect(data.find(({ name }) => name === 'PEG tubes').value).toBe(10);
  });

  it('should have Sclerotherapy needle 10% of the ideal level', () => {
    expect(data.find(({ name }) => name === 'Sclerotherapy needle').value).toBe(0.1);
  });

  it('should aggregate multiple entries for Oesophageal stent', () => {
    expect(data.find(({ name }) => name === 'Oesophageal stent').value).toBe(1);
  });

  it('should cope with numerators and no denominators', () => {
    expect(data.find(({ name }) => name === 'Haemoclips').value).toBe('No data');
  });

  it('should cope with denominators and no numerators', () => {
    expect(data.find(({ name }) => name === 'Haemoclips').value).toBe('No data');
  });

  it('should return the correct average', () => {
    expect(aggregate.count).toBe(3);
    expect(aggregate.sum).toBe(11.1);
  });
});
