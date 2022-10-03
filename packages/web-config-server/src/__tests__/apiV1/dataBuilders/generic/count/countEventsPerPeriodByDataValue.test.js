/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { createJestMockInstance } from '@tupaia/utils';
import { CountEventsPerPeriodByDataValueBuilder } from '/apiV1/dataBuilders/generic/count/countEventsPerPeriodByDataValue';

const EVENTS = [
  {
    organisationUnitCode: 'ORG1',
    eventDate: '2020-02-03T11:14:00.000',
    dataValues: { element1: 'value1' },
  },
  {
    organisationUnitCode: 'ORG1',
    eventDate: '2020-02-03T11:14:00.000',
    dataValues: { element1: 'value2' },
  },
  {
    organisationUnitCode: 'ORG1',
    eventDate: '2020-02-10T11:14:00.000',
    dataValues: { element1: 'value1' },
  },
  {
    organisationUnitCode: 'ORG1',
    eventDate: '2020-02-10T11:15:00.000',
    dataValues: { element1: 'value1' },
  },
];

const dataServices = [{ isDataRegional: true }];
const models = {};
const entity = {};
const query = { organisationUnitCode: 'PG' };

const fetchEvents = jest.fn().mockResolvedValue(EVENTS);
const aggregator = createJestMockInstance('@tupaia/aggregator', 'Aggregator', { fetchEvents });
const dhisApi = createJestMockInstance('@tupaia/dhis-api', 'DhisApi');

describe('CountEventsPerPeriodByDataValueBuilder', () => {
  it('should return number of events by type for an existing dataElement', async () => {
    const config = {
      dataElement: 'element1',
      isPercentage: true,
      periodType: 'week',
      dataServices,
    };
    const builder = new CountEventsPerPeriodByDataValueBuilder(
      models,
      aggregator,
      dhisApi,
      config,
      query,
      entity,
    );

    const response = await builder.build();
    expect(response).toStrictEqual({
      data: [
        { value1: 0.5, value2: 0.5, timestamp: 1580688000000, name: '3rd Feb 2020' },
        { value1: 1, timestamp: 1581292800000, name: '10th Feb 2020' },
      ],
    });
  });
});
