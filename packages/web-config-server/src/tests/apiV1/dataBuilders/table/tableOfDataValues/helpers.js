/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { Aggregator } from '/aggregator';
import { tableOfDataValues } from '/apiV1/dataBuilders';
import { DhisApi } from '/dhis/DhisApi';
import groupBy from 'lodash.groupby';

const query = { organisationUnitCode: 'TO' };
const dataServices = [{ isDataRegional: false }];

const createAggregatorStub = dataValues => {
  const fetchAnalytics = sinon.stub();
  fetchAnalytics
    .returns({ results: [] })
    .withArgs(sinon.match.any, sinon.match({ dataServices }), sinon.match(query))
    .callsFake(dataElementCodes => ({
      results: Object.values(dataValues).filter(({ dataElement }) =>
        dataElementCodes.includes(dataElement),
      ),
    }));

  return sinon.createStubInstance(Aggregator, { fetchAnalytics });
};

// Remove the opening 'code:in:[' and trailing ']' and split on commas
const convertCodesFilterStringToArrayOfCodes = codesFilterString =>
  codesFilterString
    .substr(9)
    .slice(0, -1)
    .split(',');

const createDhisApiStub = dataValues => {
  const fetch = sinon.stub();
  fetch
    .returns({ dataElements: [] })
    .withArgs(
      sinon.match('dataElements'),
      sinon.match({
        filter: sinon.match(/code:in:\[.*\]/),
        fields: sinon.match('id,code,name,optionSet'),
      }),
    )
    .callsFake((endpoint, { filter }) => {
      const dataElements = [];
      const codes = convertCodesFilterStringToArrayOfCodes(filter);
      const dataValuesByCode = groupBy(dataValues, val => val.dataElement);
      codes.forEach(code => {
        const dataValue = dataValuesByCode[code] ? dataValuesByCode[code][0] : undefined;
        if (dataValue && dataValue.metadata) {
          dataElements.push(dataValue.metadata);
        }
      });

      return { dataElements };
    });

  return sinon.createStubInstance(DhisApi, { fetch });
};

export const createAssertTableResults = availableDataValues => {
  const aggregator = createAggregatorStub(availableDataValues);
  const dhisApi = createDhisApiStub(availableDataValues);

  return async (tableConfig, expectedResults) => {
    const dataBuilderConfig = { ...tableConfig, dataServices };
    return expect(
      tableOfDataValues({ dataBuilderConfig, query }, aggregator, dhisApi),
    ).to.eventually.deep.equal(expectedResults);
  };
};

export const createAssertErrorIsThrown = availableDataValues => {
  const aggregator = createAggregatorStub(availableDataValues);
  const dhisApi = createDhisApiStub(availableDataValues);

  return async (tableConfig, expectedError) => {
    const dataBuilderConfig = { ...tableConfig, dataServices };
    return expect(
      tableOfDataValues({ dataBuilderConfig, query }, aggregator, dhisApi),
    ).to.eventually.be.rejectedWith(expectedError);
  };
};
