import { expect } from 'chai';
import { it, describe } from 'mocha';

import { simpleTableOfEvents } from '../../../../apiV1/dataBuilders/generic/table/simpleTableOfEvents';

/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

const dataBuilderConfig = {
  dataElementCode: 'WHOSPAR',
  programCode: 'WSRS',
};

const query = {
  dashboardGroupId: '87',
  organisationUnitCode: 'World',
  viewId: 'WHO_SURVEY',
};

const entity = {
  code: 'World',
  type: 'world',
  country_code: 'Wo',
  name: 'World',
};

const metaData = {
  results: [
    {
      dataElement: 'RNhJHOhJeic',
      organisationUnit: 'World',
      period: '20100208',
      value: 8,
    },
    {
      dataElement: 'RNhJHOhJeic',
      organisationUnit: 'World',
      period: '20110208',
      value: 7,
    },
    {
      dataElement: 'RNhJHOhJeic',
      organisationUnit: 'World',
      period: '20120208',
      value: 13,
    },
  ],
  metadata: {
    organisationUnit: { World: 'World' },
    dataElementCodeToName: { WHOSPAR: 'WHOSPAR' },
    dataElementIdToCode: { RNhJHOhJeic: 'WHOSPAR' },
    dataElement: { RNhJHOhJeic: 'WHOSPAR' },
  },
};

const responseData = [
  {
    dataElement: 'RNhJHOhJeic',
    organisationUnit: 'World',
    period: '20100208',
    value: 8,
    name: '2010',
  },
  {
    dataElement: 'RNhJHOhJeic',
    organisationUnit: 'World',
    period: '20110208',
    value: 7,
    name: '2011',
  },
  {
    dataElement: 'RNhJHOhJeic',
    organisationUnit: 'World',
    period: '20120208',
    value: 13,
    name: '2012',
  },
];

const dhisApiMockup = {
  getEventAnalytics: dataElementCodes => {
    return Promise.resolve(metaData);
  },
};

describe('simpleTableOfEvents', async () => {
  let data;

  before(async () => {
    const response = await simpleTableOfEvents(
      {
        dataBuilderConfig,
        query,
        entity,
      },
      dhisApiMockup,
    );

    data = response.data;
  });

  it('should return expected data', () => {
    return expect(data).to.deep.equal(responseData);
  });
});
