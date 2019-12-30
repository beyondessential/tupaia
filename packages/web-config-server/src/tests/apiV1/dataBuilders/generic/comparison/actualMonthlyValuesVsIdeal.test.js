/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import { it, describe } from 'mocha';

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
    dataElement: 'q7BvvDN5nUO',
    organisationUnit: 'XyDJfD67g4M',
    period: 20131113,
    value: 80,
  },
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
  // use last year
  {
    dataElement: 'BCaFfnX6P4G',
    organisationUnit: 'XyDJfD67g4M',
    period: 20171113,
    value: 300,
  },
  {
    dataElement: 'q7BvvDN5nUO',
    organisationUnit: 'XyDJfD67g4M',
    period: 20171113,
    value: 80,
  },
  {
    dataElement: 'Moaj59PRXXL',
    organisationUnit: 'XyDJfD67g4M',
    period: 20171113,
    value: 12,
  },
  {
    dataElement: 'Moaj59PRXXL',
    organisationUnit: 'XyDJfD67g4M',
    period: 20171113,
    value: 2,
  },
  {
    dataElement: 'aEUhkBmEO29',
    organisationUnit: 'XyDJfD67g4M',
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

const idealResults = [
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

const idealMetadata = {
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
        results: actualResults,
        metadata: actualMetadata,
      });
    }
    return Promise.resolve({
      results: idealResults,
      metadata: idealMetadata,
    });
  },
};

describe('actualMonthlyValuesVsIdeal', () => {
  it('should have dates in order', async () => {
    try {
      const result = await actualMonthlyValuesVsIdeal(
        {
          dataBuilderConfig,
          query,
        },
        dhisApiMockup,
      );
      expect(result.columns[0].key).to.equal('ideal');
      expect(result.columns[1].key).to.equal(20181113);
      expect(result.columns[2].key).to.equal(20171113);
      expect(result.columns[3].key).to.equal(20131113);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  });

  it('should have Sclerotherapy needle be 80 for 20131113', async () => {
    try {
      const result = await actualMonthlyValuesVsIdeal(
        {
          dataBuilderConfig,
          query,
        },
        dhisApiMockup,
      );
      expect(result.rows[0]['20131113']).to.equal(80);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  });

  it("should have balloon dilators be 'N/A' for 20131113", async () => {
    try {
      const result = await actualMonthlyValuesVsIdeal(
        {
          dataBuilderConfig,
          query,
        },
        dhisApiMockup,
      );
      expect(result.rows.find(row => row.dataElement === 'Balloon dilators')['20131113']).to.equal(
        NO_DATA_AVAILABLE,
      );
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  });
});
