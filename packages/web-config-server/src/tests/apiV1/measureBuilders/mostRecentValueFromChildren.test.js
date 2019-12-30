/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import { it, describe } from 'mocha';

import { mostRecentValueFromChildren } from '/apiV1/measureBuilders/mostRecentValueFromChildren';

const dataBuilderConfig = { level: 'District' };

const dataElementCode = 'ssSlzCXlBFE';
const organisationUnitGroupCode = 'TO';
const organisationUnitsResults = [
  {
    code: 'TO_Niuas',
    name: 'Niuas',
    id: 'Sd91LvUfvb4',
    description: '{"level":"District"}',
    comment: '[[-16.26467579,184.04390192000002],[-15.3655722,186.54113048]]',
    children: [],
  },
  {
    code: 'TO_Eua',
    name: "'Eua",
    id: 'oLHethOxvXm',
    description: '{"level":"District"}',
    comment: '[[-21.72753848,184.813962717],[-21.1412607,185.329182183]]',
    children: [{ code: 'TO_Neikihp', level: 4, id: 'gSrMxjnaJ6P' }],
  },
  {
    code: 'TO_Haapai',
    name: "Ha'apai",
    id: 'pMdylWjFjFe',
    description: '{"level":"District"}',
    comment: '[[-20.908041580000003,184.331953673],[-19.3916863,185.993833227]]',
    children: [
      { code: 'TO_NomukaHC', level: 5, id: 'uykJXm4DobB' },
      { code: 'TO_kau', level: 4, id: 'y7Ey0JEe898' },
      { code: 'TO_Uihamch', level: 4, id: 'FdCScHF3hZZ' },
      { code: 'TO_HfevaHC', level: 4, id: 'VsRWL1jGt9K' },
      { code: 'TO_FoaMCH', level: 4, id: 'w2Zo3RKkvgg' },
      { code: 'TO_Niuuihp', level: 4, id: 'lkoOVjl5x32' },
    ],
  },
];

const analyticsData = [
  {
    dataElement: 'ssSlzCXlBFE',
    organisationUnit: 'pMdylWjFjFe',
    period: 20190320,
    value: 5,
  },
];

const dhisApiMockup = {
  getOrganisationUnits: () => organisationUnitsResults,
  getAnalytics: () => ({
    results: analyticsData,
  }),
};

describe('mostRecentValueFromChildren', () => {
  it('should get the most recent period ', async () => {
    const result = await mostRecentValueFromChildren(
      dhisApiMockup,
      { dataElementCode, organisationUnitGroupCode },
      dataBuilderConfig,
    );
    const correctResult = result.find(
      ({ organisationUnitCode }) => organisationUnitCode === 'TO_Haapai',
    );
    const latestDate = analyticsData.sort((x, y) => y.period - x.period)[0].period;
    expect(correctResult[dataElementCode]).to.equal(5);
    expect(correctResult.period).to.equal(latestDate);
  });

  it('should handle a district with no facilities ', async () => {
    const result = await mostRecentValueFromChildren(
      dhisApiMockup,
      { dataElementCode, organisationUnitGroupCode },
      dataBuilderConfig,
    );
    const correctResult = result.find(
      ({ organisationUnitCode }) => organisationUnitCode === 'TO_Niuas',
    );
    expect(correctResult.organisationUnitCode).to.equal('TO_Niuas');
    /* eslint-disable no-unused-expressions */
    expect(correctResult[dataElementCode]).to.be.null;
    expect(correctResult.period).to.be.null;
    /* eslint-enable no-unused-expressions */
  });

  it('should handle a facilities with no data points ', async () => {
    const result = await mostRecentValueFromChildren(
      dhisApiMockup,
      { dataElementCode, organisationUnitGroupCode },
      dataBuilderConfig,
    );
    const correctResult = result.find(
      ({ organisationUnitCode }) => organisationUnitCode === 'TO_Eua',
    );

    expect(correctResult.organisationUnitCode).to.equal('TO_Eua');

    /* eslint-disable no-unused-expressions */
    expect(correctResult[dataElementCode]).to.be.null;
    expect(correctResult.period).to.be.null;
    /* eslint-enable no-unused-expressions */
  });
});
