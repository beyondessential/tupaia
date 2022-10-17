/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { when } from 'jest-when';

import { groupEventsPerOrgUnit } from '/apiV1/measureBuilders/groupEventsPerOrgUnit';

const models = {};
const organisationUnitCode = 'PG';
const programCode = 'SCRF';
const dataServices = [{ isDataRegional: true }];
const dataSourceEntityType = 'village';
const dataSourceEntityFilter = undefined;

const query = { organisationUnitCode, dataElementCode: 'value' };
const entity = { code: organisationUnitCode };

const groups = {
  fourOrMore: {
    value: 4,
    operator: '>=',
  },
  twoToThree: {
    value: [2, 3],
    operator: 'range',
  },
  lessThanTwo: {
    value: 2,
    operator: '<',
  },
};

const config = {
  programCode,
  dataServices,
  groups,
  dataSourceType: 'custom',
  dataSourceEntityFilter,
  entityAggregation: {
    aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
    dataSourceEntityType,
    aggregationEntityType: 'facility',
  },
};

const events = [
  {
    orgUnit: 'oneEventLand',
    event: '1',
  },
  {
    orgUnit: 'twoEventLand',
    event: '2',
  },
  {
    orgUnit: 'twoEventLand',
    event: '3',
  },
  {
    orgUnit: 'threeEventLand',
    event: '4',
  },
  {
    orgUnit: 'threeEventLand',
    event: '5',
  },
  {
    orgUnit: 'threeEventLand',
    event: '6',
  },
  {
    orgUnit: 'fourEventLand',
    event: '7',
  },
  {
    orgUnit: 'fourEventLand',
    event: '8',
  },
  {
    orgUnit: 'fourEventLand',
    event: '9',
  },
  {
    orgUnit: 'fourEventLand',
    event: '10',
  },
];

const createAggregator = () => {
  const fetchEvents = jest.fn();
  when(fetchEvents)
    .calledWith(programCode, {
      dataServices,
      entityAggregation: config.entityAggregation,
      dataSourceEntityFilter,
      organisationUnitCode,
      startDate: undefined,
      endDate: undefined,
      trackedEntityInstance: undefined,
      eventId: undefined,
    })
    .mockResolvedValue(events);

  return {
    fetchEvents,
  };
};

describe('groupEventsPerOrgUnit', () => {
  const aggregator = createAggregator();

  it('should group counts of events into buckets', async () => {
    const response = await groupEventsPerOrgUnit(models, aggregator, {}, query, config, entity);
    expect(response).toStrictEqual({
      data: [
        { organisationUnitCode: 'oneEventLand', value: 'lessThanTwo', originalValue: 1 },
        { organisationUnitCode: 'twoEventLand', value: 'twoToThree', originalValue: 2 },
        { organisationUnitCode: 'threeEventLand', value: 'twoToThree', originalValue: 3 },
        { organisationUnitCode: 'fourEventLand', value: 'fourOrMore', originalValue: 4 },
      ],
      period: null,
    });
  });

  it('should keep original value if there is no appropriate bucket', async () => {
    const newConfig = {
      ...config,
      groups: {
        threeOrMore: {
          value: 3,
          operator: '>=',
        },
      },
    };

    const response = await groupEventsPerOrgUnit(models, aggregator, {}, query, newConfig, entity);
    expect(response).toStrictEqual({
      data: [
        { organisationUnitCode: 'oneEventLand', value: 1, originalValue: 1 },
        { organisationUnitCode: 'twoEventLand', value: 2, originalValue: 2 },
        { organisationUnitCode: 'threeEventLand', value: 'threeOrMore', originalValue: 3 },
        { organisationUnitCode: 'fourEventLand', value: 'threeOrMore', originalValue: 4 },
      ],
      period: null,
    });
  });

  it('should throw an error if there is no grouping check defined for operator', async () => {
    const newConfig = {
      ...config,
      groups: {
        noOp: {
          value: 3,
          operator: 'no-op',
        },
      },
    };

    expect(
      groupEventsPerOrgUnit(models, aggregator, {}, query, newConfig, entity),
    ).toBeRejectedWith("Unknown operator: 'no-op'");
  });
});
