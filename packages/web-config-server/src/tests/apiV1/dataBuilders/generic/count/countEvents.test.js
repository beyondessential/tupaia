/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { Aggregator } from '@tupaia/aggregator';
import { CountEventsBuilder } from '/apiV1/dataBuilders/generic/count/countEvents';

const MOCK_EVENTS = [
  {
    dataValues: { A: { value: '10' }, B: { value: '20' }, C: { value: '30' } },
  },
  {
    dataValues: { A: { value: '10' }, B: { value: '20' }, C: { value: '31' } },
  },
  {
    dataValues: { A: { value: '10' }, B: { value: '21' } },
  },
  {
    dataValues: { A: { value: '10' }, B: { value: '21' } },
  },
];

const dataServices = [{ isDataRegional: true }];
const entity = {};
const query = { organisationUnitCode: 'PG' };
const models = {
  project: { findOne: sinon.stub().resolves({ entity_hierarchy_id: 'xxx' }) },
};

const fetchEvents = sinon.stub().returns(MOCK_EVENTS);
const aggregator = sinon.createStubInstance(Aggregator, { fetchEvents });
const dhisApi = {};

describe('CountEventsBuilder', () => {
  const assertBuilderResponseIsCorrect = async (builderConfig, expectedResponse) => {
    const config = { ...builderConfig, dataServices };
    const builder = new CountEventsBuilder(models, aggregator, dhisApi, config, query, entity);
    return expect(builder.build()).to.eventually.deep.equal(expectedResponse);
  };

  it('counts events', () =>
    assertBuilderResponseIsCorrect(
      {},
      {
        data: [{ name: 'value', value: 4 }],
      },
    ));

  it('counts events when grouped', () =>
    // Note: this is testing groupBy as well, which is outside the responsibility of this unit test,
    // but it's difficult to mock an imported function
    assertBuilderResponseIsCorrect(
      {
        groupBy: {
          type: 'nothing',
        },
      },
      {
        data: [{ name: 'all', value: 4 }],
      },
    ));
});
