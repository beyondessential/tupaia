/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { it, describe } from 'mocha';

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
    dataElement: 'BCaFfnX6P4G',
    organisationUnit: 'XyDJfD67g4M',
    period: 20181113,
    value: 300,
  },
  {
    dataElement: 'q7BvvDN5nUO',
    organisationUnit: 'XyDJfD67g4M',
    period: 20181113,
    value: 40,
  },
  {
    dataElement: 'Moaj59PRXXL',
    organisationUnit: 'XyDJfD67g4M',
    period: 20181113,
    value: 5,
  },
  {
    dataElement: 'Moaj59PRXXL',
    organisationUnit: 'XyDJfD67g4M',
    period: 20181113,
    value: 5,
  },
  {
    dataElement: 'aEUhkBmEO29',
    organisationUnit: 'XyDJfD67g4M',
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
  dataElementIdToCode: {
    q7BvvDN5nUO: 'FIJIINV014',
    BCaFfnX6P4G: 'FIJIINV047',
    aEUhkBmEO29: 'FIJIINV011',
    Moaj59PRXXL: 'FIJIINV029',
    ZH5j6XNpDC6: 'FIJIINV023',
  },
  dataElement: {
    q7BvvDN5nUO: 'Endoscopy inventory: Sclerotherapy needle (Actual inventory)',
    BCaFfnX6P4G: 'Endoscopy inventory: PEG tubes (Actual inventory)',
    Moaj59PRXXL: 'Endoscopy inventory: Oesophageal stent (Actual inventory)',
    aEUhkBmEO29: 'Endoscopy inventory: Haemoclips (Actual inventory)',
    ZH5j6XNpDC6: 'Endoscopy inventory: Balloon dilators (Actual inventory)',
  },
  period: {},
  organisationUnit: {
    XyDJfD67g4M: 'Vaiola Hospital',
  },
  undefined: {
    HllvX50cXC0: 'default',
  },
};

const denominatorResults = [
  {
    dataElement: 'ELrx8mpCRvn',
    organisationUnit: 'XyDJfD67g4M',
    period: 20181113,
    value: 30,
  },
  {
    dataElement: 'uGRpXGDAB07',
    organisationUnit: 'XyDJfD67g4M',
    period: 20181113,
    value: 400,
  },
  {
    dataElement: 'Arr04LSf5kR',
    organisationUnit: 'XyDJfD67g4M',
    period: 20181113,
    value: 10,
  },
  {
    dataElement: 'Shhcxkooksa',
    organisationUnit: 'XyDJfD67g4M',
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
  dataElementIdToCode: {
    uGRpXGDAB07: 'ANZIDEAL009',
    ELrx8mpCRvn: 'ANZIDEAL032',
    Arr04LSf5kR: 'ANZIDEAL020',
    AKjsdncosks: 'ANZIDEAL099',
    Shhcxkooksa: 'ANZIDEAL000',
  },
  dataElement: {
    uGRpXGDAB07: 'Endoscopy inventory: Sclerotherapy needle (Ideal inventory)',
    ELrx8mpCRvn: 'Endoscopy inventory: PEG tubes (Ideal inventory)',
    XN2DTWKq2nw: 'Endoscopy inventory: Variceal bander (Ideal inventory)',
    AKjsdncosks: 'Endoscopy inventory: Haemoclips (Ideal inventory)',
    Shhcxkooksa: 'Endoscopy inventory: Balloon dilators (Ideal inventory)',
  },
  period: {},
  organisationUnit: {
    XyDJfD67g4M: 'Vaiola Hospital',
  },
  undefined: {
    HllvX50cXC0: 'default',
  },
};

const query = {
  viewId: 'TO_VHP_Descriptive_Consumables',
  organisationUnitCode: 'TO_VHP',
  dashboardGroupId: '26',
  cacheBreaker: 'pe8rac324243',
  organisationUnitId: 'XyDJfD67g4M',
  period: null,
};

const dhisApiMockup = {
  getAnalytics: ({ dataElementCodes }) => {
    if (dataElementCodes.indexOf('FIJIINV011') !== -1) {
      return Promise.resolve({
        results: numeratorResults,
        metadata: numeratorMetadata,
      });
    }
    return Promise.resolve({
      results: denominatorResults,
      metadata: denominatorMetadata,
    });
  },
};

describe('percentagesByNominatedPairs', async () => {
  let data;
  let aggregate;

  before(async () => {
    const response = await percentagesByNominatedPairs(
      {
        dataBuilderConfig,
        query,
      },
      dhisApiMockup,
    );
    data = response.data;
    aggregate = response.aggregate;
  });

  it('should have PEG tubes 10 times the ideal level', () => {
    expect(data.find(({ name }) => name === 'PEG tubes').value).to.equal(10);
  });

  it('should have Sclerotherapy needle 10% of the ideal level', () => {
    expect(data.find(({ name }) => name === 'Sclerotherapy needle').value).to.equal(0.1);
  });

  it('should aggregate multiple entries for Oesophageal stent', () => {
    expect(data.find(({ name }) => name === 'Oesophageal stent').value).to.equal(1);
  });

  it('should cope with numerators and no denominators', () => {
    expect(data.find(({ name }) => name === 'Haemoclips').value).to.equal('N/A');
  });

  it('should cope with denominators and no numerators', () => {
    expect(data.find(({ name }) => name === 'Haemoclips').value).to.equal('N/A');
  });

  it('should return the correct average', () => {
    expect(aggregate.count).to.equal(3);
    expect(aggregate.sum).to.equal(11.1);
  });
});
