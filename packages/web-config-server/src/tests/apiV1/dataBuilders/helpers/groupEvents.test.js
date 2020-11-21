/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import sinon from 'sinon';

import { groupEvents, getAllDataElementCodes } from '/apiV1/dataBuilders/helpers/groupEvents';

const EVENTS_1 = [
  {
    orgUnit: 'TO_Tongatapu',
    orgUnitName: 'Tongatapu',
    dataValues: [{ dataElement: 'A', value: '1' }],
  },
  { orgUnit: 'TO_Niuas', orgUnitName: 'Niuas', dataValues: [{ dataElement: 'A', value: '2' }] },
  { orgUnit: 'TO_Niuas', orgUnitName: 'Niuas', dataValues: [{ dataElement: 'A', value: '3' }] },
];

const EVENTS_2 = [
  {
    dataValues: [
      { dataElement: 'A', value: '10' },
      { dataElement: 'B', value: '20' },
    ],
  },
  {
    dataValues: [
      { dataElement: 'A', value: '10' },
      { dataElement: 'B', value: '21' },
    ],
  },
  {
    dataValues: [{ dataElement: 'C', value: '30' }],
  },
];

const PARENT_ORG_UNIT = {
  code: 'TO',
  name: 'Tonga',
  getDescendantsOfType: (_, type) =>
    type === 'district'
      ? [
          { code: 'TO_Tongatapu', name: 'Tongatapu' },
          { code: 'TO_Niuas', name: 'Niuas' },
          { code: 'TO_Haapai', name: 'Haapai' },
        ]
      : [],
};

const models = {
  entity: {
    findOne: sinon
      .stub()
      .callsFake(({ code }) => (code === PARENT_ORG_UNIT.code ? PARENT_ORG_UNIT : null)),
  },
};

describe('groupEvents()', () => {
  it('groups by nothing', () =>
    expect(groupEvents(models, EVENTS_1, { type: 'nothing' })).to.eventually.deep.equal({
      all: [...EVENTS_1],
    }));

  it('groups by allOrgUnitNames', () =>
    expect(
      groupEvents(models, EVENTS_1, {
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

  it('rejects unknown groupBy type', async () => {
    const assertCorrectErrorIsThrown = groupBySpecs =>
      expect(groupEvents(models, EVENTS_1, groupBySpecs)).to.be.rejectedWith(
        'not a supported groupBy type',
      );

    return Promise.all([{ type: 'unknownType' }, { type: '' }, {}].map(assertCorrectErrorIsThrown));
  });

  it('groups by dataValues basic', () => {
    expect(
      groupEvents(models, EVENTS_2, {
        type: 'dataValues',
        options: {
          GROUPING_1: {
            dataValues: { A: { operator: '=', value: '10' } },
          },
          GROUPING_2: {
            dataValues: { B: { operator: '=', value: '21' } },
          },
        },
      }),
    ).to.eventually.deep.equal({
      GROUPING_1: [
        {
          dataValues: [
            { dataElement: 'A', value: '10' },
            { dataElement: 'B', value: '20' },
          ],
        },
        {
          dataValues: [
            { dataElement: 'A', value: '10' },
            { dataElement: 'B', value: '21' },
          ],
        },
      ],
      GROUPING_2: [
        {
          dataValues: [
            { dataElement: 'A', value: '10' },
            { dataElement: 'B', value: '21' },
          ],
        },
      ],
    });
  });

  it('uses a union type condition check when grouping by dataValues', () => {
    expect(
      groupEvents(models, EVENTS_2, {
        type: 'dataValues',
        options: {
          GROUPING_1: {
            dataValues: { A: { operator: '=', value: '10' }, B: { operator: '=', value: '21' } },
          },
        },
      }),
    ).to.eventually.deep.equal({
      GROUPING_1: [
        {
          dataValues: [
            { dataElement: 'A', value: '10' },
            { dataElement: 'B', value: '21' },
          ],
        },
      ],
    });
  });

  it('getAllDataElementCodes returns empty by default', () =>
    expect(
      getAllDataElementCodes({
        type: 'allOrgUnitNames',
        options: { parentCode: 'TO', type: 'district' },
      }),
    ).to.deep.equal([]));

  it('getAllDataElementCodes finds all data element codes used in conditionals', () =>
    expect(
      getAllDataElementCodes({
        type: 'dataValues',
        options: {
          GROUPING_1: {
            dataValues: { A: { operator: '=', value: '10' } },
          },
          GROUPING_2: {
            dataValues: { B: { operator: '=', value: '21' } },
          },
        },
      }),
    ).to.deep.equal(['A', 'B']));
});
