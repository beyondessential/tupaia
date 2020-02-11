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

const metaData = [
  {
    program: 'WSRS',
    event: 'DWXLuP9CXqm',
    orgUnit: 'World',
    status: 'ACTIVE',
    orgUnitName: 'World',
    eventDate: '2010-02-08T14:11:00.000',
    dataValues: {
      WHOSPAR: {
        dataElement: 'WHOSPAR',
        value: '13',
      },
    },
  },
  {
    program: 'WSRS',
    event: 'DWXLuP9CXqm',
    orgUnit: 'World',
    status: 'ACTIVE',
    orgUnitName: 'World',
    eventDate: '2011-02-08T14:11:00.000',
    dataValues: {
      WHOSPAR: {
        dataElement: 'WHOSPAR',
        value: '8',
      },
    },
  },
];

const responseData = [
  {
    organisationUnit: 'World',
    period: undefined,
    dataElementCode: 'DWXLuP9CXqm',
    dataElementId: 'DWXLuP9CXqm',
    name: '2010',
    value: '13',
  },
  {
    organisationUnit: 'World',
    period: undefined,
    dataElementCode: 'DWXLuP9CXqm',
    dataElementId: 'DWXLuP9CXqm',
    name: '2011',
    value: '8',
  },
];

const dhisApiMockup = {
  getEvents: ({ organisationUnitCode }) => {
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
      },
      dhisApiMockup,
    );
    data = response.data;
  });

  it('should return expected data', () => {
    return expect(data).to.deep.equal(responseData);
  });
});
