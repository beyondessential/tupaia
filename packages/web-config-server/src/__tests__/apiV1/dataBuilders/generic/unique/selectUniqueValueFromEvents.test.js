/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { createJestMockInstance } from '@tupaia/utils';
import { selectUniqueValueFromEvents } from '/apiV1/dataBuilders/generic/unique';
import { NO_UNIQUE_VALUE } from '/apiV1/dataBuilders/helpers/uniqueValues';

const EVENTS = [
  {
    organisationUnitCode: 'ORG1',
    eventDate: '2020-02-03T11:14:00.000',
    dataValues: { element1: 'value1', element2: 'value2' },
  },
  {
    organisationUnitCode: 'ORG1',
    eventDate: '2020-02-03T11:14:00.000',
    dataValues: { element1: 'value1', element2: 'value2' },
  },
  {
    organisationUnitCode: 'ORG1',
    eventDate: '2020-02-10T11:14:00.000',
    dataValues: { element1: 'value1', element2: 'value2' },
  },
  {
    organisationUnitCode: 'ORG1',
    eventDate: '2020-02-10T11:15:00.000',
    dataValues: { element1: 'value1', element2: 'value3' },
  },
];

const dataServices = [{ isDataRegional: false }];
const entity = {};
const query = { organisationUnitCode: 'TO' };

const aggregator = createJestMockInstance('@tupaia/aggregator', 'Aggregator', {
  fetchEvents: async () => EVENTS,
});
const dhisApi = createJestMockInstance('@tupaia/dhis-api', 'DhisApi');

describe('selectUniqueValueFromEvents', () => {
  it('returns the unique value if it exists', async () => {
    const dataBuilderConfig = { valueToSelect: 'element1', dataServices };
    const response = await selectUniqueValueFromEvents(
      { dataBuilderConfig, query, entity },
      aggregator,
      dhisApi,
    );
    return expect(response).toStrictEqual({ data: [{ name: 'element1', value: 'value1' }] });
  });

  it('returns no unique value if there is no unique value', async () => {
    const dataBuilderConfig = { valueToSelect: 'element2', dataServices };
    const response = await selectUniqueValueFromEvents(
      { dataBuilderConfig, query, entity },
      aggregator,
      dhisApi,
    );
    return expect(response).toStrictEqual({ data: [{ name: 'element2', value: NO_UNIQUE_VALUE }] });
  });

  it('returns undefined if no events exist containing the valueToSelect', async () => {
    const dataBuilderConfig = { valueToSelect: 'element3', dataServices };
    const response = await selectUniqueValueFromEvents(
      { dataBuilderConfig, query, entity },
      aggregator,
      dhisApi,
    );
    return expect(response).toStrictEqual({ data: [{ name: 'element3', value: undefined }] });
  });
});
