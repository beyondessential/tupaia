/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { createJestMockInstance } from '@tupaia/utils';
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
  project: { findOne: async () => ({ entity_hierarchy_id: 'xxx' }) },
};

const fetchEvents = async () => MOCK_EVENTS;
const aggregator = createJestMockInstance('@tupaia/aggregator', 'Aggregator', { fetchEvents });
const dhisApi = createJestMockInstance('@tupaia/dhis-api', 'DhisApi');

describe('CountEventsBuilder', () => {
  it('counts events', async () => {
    const config = { dataServices };
    const builder = new CountEventsBuilder(models, aggregator, dhisApi, config, query, entity);

    const response = await builder.build();
    expect(response).toStrictEqual({
      data: [{ name: 'value', value: 4 }],
    });
  });

  it('counts events when grouped', async () => {
    // Note: this is testing groupBy as well, which is outside the responsibility of this unit test,
    // but it's difficult to mock an imported function
    const config = { dataServices, groupBy: { type: 'nothing' } };
    const builder = new CountEventsBuilder(models, aggregator, dhisApi, config, query, entity);

    const response = await builder.build();
    expect(response).toStrictEqual({
      data: [{ name: 'all', value: 4 }],
    });
  });
});
