import { when } from 'jest-when';
import { pickBy } from 'es-toolkit/compat';

import { createJestMockInstance } from '@tupaia/utils';
import { DATA_ELEMENTS, ORG_UNITS } from './tableOfDataValues.fixtures';

const query = { organisationUnitCode: 'TO' };
const dataServices = [{ isDataRegional: false }];
const period = {
  requested: '202001;202002;202003;202004',
  earliestAvailable: '20200105',
  latestAvailable: '20200406',
};

const createAggregatorStub = dataValues => {
  const fetchAnalytics = jest.fn();
  when(fetchAnalytics)
    .calledWith(
      expect.anything(),
      expect.objectContaining({ dataServices }),
      expect.objectContaining(query),
      expect.anything(),
    )
    .mockImplementation(dataElementCodes => ({
      results: Object.values(dataValues).filter(({ dataElement }) =>
        dataElementCodes.includes(dataElement),
      ),
      period,
    }));

  const fetchDataElements = jest.fn();
  when(fetchDataElements)
    .calledWith(
      expect.anything(),
      expect.objectContaining({
        organisationUnitCode: query.organisationUnitCode,
        dataServices,
        includeOptions: true,
      }),
    )
    .mockImplementation(codes => pickBy(DATA_ELEMENTS, ({ code }) => codes.includes(code)));

  return createJestMockInstance('@tupaia/aggregator', 'Aggregator', {
    aggregationTypes: {
      SUM_MOST_RECENT_PER_FACILITY: 'SUM_MOST_RECENT_PER_FACILITY',
    },
    fetchAnalytics,
    fetchDataElements,
  });
};

const dhisApi = createJestMockInstance('@tupaia/dhis-api', 'DhisApi');

const models = {
  entity: {
    find: ({ code: codes }) => ORG_UNITS.filter(({ code }) => codes.includes(code)),
  },
};

export const createAssertTableResults = (table, availableDataValues) => {
  const aggregator = createAggregatorStub(availableDataValues);

  return async (tableConfig, expectedResults) => {
    const dataBuilderConfig = { ...tableConfig, dataServices };
    const results = await table({ models, dataBuilderConfig, query }, aggregator, dhisApi);
    return expect(results).toStrictEqual({ period, ...expectedResults });
  };
};

export const createAssertErrorIsThrown = (table, availableDataValues) => {
  const aggregator = createAggregatorStub(availableDataValues);

  return async (tableConfig, expectedError) => {
    const dataBuilderConfig = { ...tableConfig, dataServices };
    return expect(
      table({ models, dataBuilderConfig, query }, aggregator, dhisApi),
    ).toBeRejectedWith(expectedError);
  };
};
