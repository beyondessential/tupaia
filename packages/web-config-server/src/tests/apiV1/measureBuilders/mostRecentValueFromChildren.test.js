/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { it, describe } from 'mocha';
import sinon from 'sinon';

import { Entity, Facility } from '/models';
import { mostRecentValueFromChildren } from '/apiV1/measureBuilders/mostRecentValueFromChildren';

const dataBuilderConfig = { level: 'District' };

const dataElementCode = 'POP01';
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
    dataElement: 'POP01',
    organisationUnit: 'TO_Haapai',
    period: 20190320,
    value: 5,
  },
];

const aggregatorMockup = {
  aggregationTypes: { MOST_RECENT: 'MOST_RECENT' },
  fetchAnalytics: () => ({
    results: analyticsData,
  }),
};
const dhisApiMockup = {
  getOrganisationUnits: () => organisationUnitsResults,
};

describe('mostRecentValueFromChildren', () => {
  before(() => {
    sinon.stub(Entity, 'findOne').returns({
      name: '',
      photo_url: '',
      getOrganisationLevel: () => '',
    });
    sinon.stub(Facility, 'findOne').returns({
      type_name: '',
      type: '',
    });
  });

  after(() => {
    Entity.findOne.restore();
    Facility.findOne.restore();
  });

  it('should get the most recent period ', async () => {
    const result = await mostRecentValueFromChildren(
      aggregatorMockup,
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
      aggregatorMockup,
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

  it('should handle a facility with no data points ', async () => {
    const result = await mostRecentValueFromChildren(
      aggregatorMockup,
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
