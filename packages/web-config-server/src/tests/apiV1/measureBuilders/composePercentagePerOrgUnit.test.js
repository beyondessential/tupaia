/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { composePercentagePerOrgUnit } from '/apiV1/measureBuilders';
import * as FetchComposedData from '/apiV1/measureBuilders/helpers';

const aggregator = {};
const dhisApi = {};
const config = {};
const query = { dataElementCode: 'value' };

const stubFetchComposedData = expectedResults => {
  const fetchComposedDataStub = sinon.stub(FetchComposedData, 'fetchComposedData');
  fetchComposedDataStub
    .returns({})
    .withArgs(aggregator, dhisApi, query, config)
    .returns(expectedResults);
};

describe('composePercentagePerOrgUnit', () => {
  afterEach(() => {
    FetchComposedData.fetchComposedData.restore();
  });

  it('should compose data per org unit into percentages', async () => {
    stubFetchComposedData({
      numerator: [
        { name: 'Kolonga', organisationUnitCode: 'TO_KlongaHC', value: 1 },
        { name: 'Nukunuku', organisationUnitCode: 'TO_Nukuhc', value: 2 },
      ],
      denominator: [
        { name: 'Kolonga', organisationUnitCode: 'TO_KlongaHC', value: 2 },
        { name: 'Nukunuku', organisationUnitCode: 'TO_Nukuhc', value: 8 },
      ],
    });

    return expect(
      composePercentagePerOrgUnit(aggregator, dhisApi, query, config),
    ).to.eventually.deep.equal([
      { name: 'Kolonga', organisationUnitCode: 'TO_KlongaHC', value: 0.5 },
      { name: 'Nukunuku', organisationUnitCode: 'TO_Nukuhc', value: 0.25 },
    ]);
  });

  it('should exclude non numeric percentages from the results', async () => {
    stubFetchComposedData({
      numerator: [
        { name: 'Kolonga', organisationUnitCode: 'TO_KlongaHC', value: 1 },
        { name: 'Nukunuku', organisationUnitCode: 'TO_Nukuhc', value: 2 },
      ],
      denominator: [
        { name: 'Kolonga', organisationUnitCode: 'TO_KlongaHC', value: 2 },
        { name: 'Nukunuku', organisationUnitCode: 'TO_Nukuhc', value: 0 }, // 0 denominator
      ],
    });

    return expect(
      composePercentagePerOrgUnit(aggregator, dhisApi, query, config),
    ).to.eventually.deep.equal([
      { name: 'Kolonga', organisationUnitCode: 'TO_KlongaHC', value: 0.5 },
    ]);
  });
});
