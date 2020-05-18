/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import sinon from 'sinon';

import { groupEvents } from '/apiV1/dataBuilders/helpers/groupEvents';
import * as Models from '/models/Entity';

const EVENTS = [
  {
    orgUnit: 'TO_Tongatapu',
    orgUnitName: 'Tongatapu',
    dataValues: [{ dataElement: 'A', value: '1' }],
  },
  { orgUnit: 'TO_Niuas', orgUnitName: 'Niuas', dataValues: [{ dataElement: 'A', value: '2' }] },
  { orgUnit: 'TO_Niuas', orgUnitName: 'Niuas', dataValues: [{ dataElement: 'A', value: '3' }] },
];
const PARENT_ORG_UNIT = {
  code: 'TO',
  name: 'Tonga',
  getDescendantsOfType: type =>
    type === 'district'
      ? [
          { code: 'TO_Tongatapu', name: 'Tongatapu' },
          { code: 'TO_Niuas', name: 'Niuas' },
          { code: 'TO_Haapai', name: 'Haapai' },
        ]
      : [],
};

const stubEntity = () => {
  sinon
    .stub(Models.Entity, 'findOne')
    .callsFake(({ code }) => (code === PARENT_ORG_UNIT.code ? PARENT_ORG_UNIT : null));
};

const restoreEntity = () => {
  Models.Entity.findOne.restore();
};

describe('groupEvents()', () => {
  before(() => {
    stubEntity();
  });

  after(() => {
    restoreEntity();
  });

  it('allOrgUnitNames', () =>
    expect(
      groupEvents(EVENTS, {
        type: 'allOrgUnitNames',
        options: { parentCode: 'TO', type: 'district' },
      }),
    ).to.eventually.deep.equal({
      Tongatapu: [
        {
          orgUnit: 'TO_Tongatapu',
          orgUnitName: 'Tongatapu',
          dataValues: [{ dataElement: 'A', value: '1' }],
        },
      ],
      Niuas: [
        {
          orgUnit: 'TO_Niuas',
          orgUnitName: 'Niuas',
          dataValues: [{ dataElement: 'A', value: '2' }],
        },
        {
          orgUnit: 'TO_Niuas',
          orgUnitName: 'Niuas',
          dataValues: [{ dataElement: 'A', value: '3' }],
        },
      ],
      Haapai: [],
    }));

  it('unknown groupBy type', async () => {
    const assertCorrectErrorIsThrown = groupBySpecs =>
      expect(groupEvents(EVENTS, groupBySpecs)).to.be.rejectedWith(/not a supported groupBy type/);

    return Promise.all([{ type: 'unknownType' }, { type: '' }, {}].map(assertCorrectErrorIsThrown));
  });
});
