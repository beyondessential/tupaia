/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { Aggregator } from '@tupaia/aggregator';
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

const fetchEvents = sinon.stub().returns(EVENTS);
const aggregator = sinon.createStubInstance(Aggregator, { fetchEvents });
const dhisApi = {};

describe('selectUniqueValueFromEvents', () => {
  const assertBuilderResponseIsCorrect = async (config, expectedResponse) => {
    const dataBuilderConfig = { ...config, dataServices };
    const response = selectUniqueValueFromEvents(
      { dataBuilderConfig, query, entity },
      aggregator,
      dhisApi,
    );
    return expect(response).to.eventually.deep.equal(expectedResponse);
  };

  it('should return the unique value if it exists', () =>
    assertBuilderResponseIsCorrect(
      { valueToSelect: 'element1' },
      { data: [{ name: 'element1', value: 'value1' }] },
    ));

  it('should return no unique value if there is no unique value', () =>
    assertBuilderResponseIsCorrect(
      { valueToSelect: 'element2' },
      { data: [{ name: 'element2', value: NO_UNIQUE_VALUE }] },
    ));

  it('should return undefined if no events exist containing the valueToSelect', () =>
    assertBuilderResponseIsCorrect(
      { valueToSelect: 'element3' },
      { data: [{ name: 'element3', value: undefined }] },
    ));
});
