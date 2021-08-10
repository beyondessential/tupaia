/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import sinon from 'sinon';

import { groupEvents, getAllDataElementCodes } from '/apiV1/dataBuilders/helpers/groupEvents';

const EVENTS = [
  {
    orgUnit: 'TO_Tongatapu',
    orgUnitName: 'Tongatapu',
    dataValues: { A: '1' },
  },
  { orgUnit: 'TO_Niuas', orgUnitName: 'Niuas', dataValues: { A: '2' } },
  { orgUnit: 'TO_Niuas', orgUnitName: 'Niuas', dataValues: { A: '3' } },
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

const PARENT_ORG_UNIT_WITH_NON_UNIQUE_NAMES = {
  code: 'NZ',
  name: 'New Zealand',
  getDescendantsOfType: (_, type) =>
    type === 'district'
      ? [
          { code: 'NZ_WELLINGTON_CITY', name: 'Wellington' },
          { code: 'NZ_WELLINGTON_OTHER', name: 'Other' }, // same name
          { code: 'NZ_AUCKLAND_OTHER', name: 'Other' }, // same name
        ]
      : [],
};

const PARENT_ORG_UNIT_WITH_CHILDREN = {
  code: 'AU1',
  name: 'Australia',
  getDescendantsOfType: (_, type) =>
    type === 'district'
      ? [
          {
            code: 'MLB',
            name: 'Melbourne',
            getDescendantsOfType: () => [{ code: 'MLB_C', name: 'Collingwood' }],
          },
          {
            code: 'SYD',
            name: 'Sydney',
            getDescendantsOfType: () => [{ code: 'SYD_U', name: 'Ultimo' }],
          },
        ]
      : [],
};

const PARENT_ORG_UNIT_WITH_NON_UNIQUE_NAMES_WITH_CHILDREN = {
  code: 'AU2',
  name: 'Australia',
  getDescendantsOfType: (_, type) =>
    type === 'district'
      ? [
          {
            code: 'MLB',
            name: 'Other', // duplicate
            getDescendantsOfType: () => [{ code: 'MLB_C', name: 'Collingwood' }],
          },
          {
            code: 'SYD',
            name: 'Other', // duplicate
            getDescendantsOfType: () => [{ code: 'SYD_U', name: 'Ultimo' }],
          },
        ]
      : [],
};

const PARENT_ORG_UNIT_WITH_CHILDREN_WITH_NON_UNIQUE_NAMES = {
  code: 'AU3',
  name: 'Australia',
  getDescendantsOfType: (_, type) =>
    type === 'district'
      ? [
          {
            code: 'MLB',
            name: 'Melbourne',
            getDescendantsOfType: () => [
              { code: 'MLB_C', name: 'Collingwood' },
              { code: 'MLB_O', name: 'Other' },
            ], // "Other" duplicate
          },
          {
            code: 'SYD',
            name: 'Sydney',
            getDescendantsOfType: () => [
              { code: 'SYD_U', name: 'Ultimo' },
              { code: 'SYD_O', name: 'Other' },
            ], // "Other" duplicate
          },
        ]
      : [],
};

const models = {
  entity: {
    findOne: sinon.stub().callsFake(({ code }) => {
      switch (code) {
        case PARENT_ORG_UNIT.code:
          return PARENT_ORG_UNIT;
        case PARENT_ORG_UNIT_WITH_NON_UNIQUE_NAMES.code:
          return PARENT_ORG_UNIT_WITH_NON_UNIQUE_NAMES;
        case PARENT_ORG_UNIT_WITH_CHILDREN.code:
          return PARENT_ORG_UNIT_WITH_CHILDREN;
        case PARENT_ORG_UNIT_WITH_NON_UNIQUE_NAMES_WITH_CHILDREN.code:
          return PARENT_ORG_UNIT_WITH_NON_UNIQUE_NAMES_WITH_CHILDREN;
        case PARENT_ORG_UNIT_WITH_CHILDREN_WITH_NON_UNIQUE_NAMES.code:
          return PARENT_ORG_UNIT_WITH_CHILDREN_WITH_NON_UNIQUE_NAMES;
        default:
          return null;
      }
    }),
  },
};

describe('groupEvents()', () => {
  it('groups by nothing', () =>
    expect(groupEvents(models, EVENTS, { type: 'nothing' })).to.eventually.deep.equal({
      all: [...EVENTS],
    }));

  it('rejects unknown groupBy type', async () => {
    const assertCorrectErrorIsThrown = groupBySpecs =>
      expect(groupEvents(models, EVENTS, groupBySpecs)).to.be.rejectedWith(
        'not a supported groupBy type',
      );

    return Promise.all([{ type: 'unknownType' }, { type: '' }, {}].map(assertCorrectErrorIsThrown));
  });

  describe('getAllDataElementCodes', () => {
    it('returns empty by default', () =>
      expect(
        getAllDataElementCodes({
          type: 'allOrgUnitNames',
          options: { parentCode: 'TO', type: 'district' },
        }),
      ).to.deep.equal([]));

    it('finds all data element codes used in conditionals', () =>
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

  describe('type: allOrgUnitNames', () => {
    it('groups', () =>
      expect(
        groupEvents(models, EVENTS, {
          type: 'allOrgUnitNames',
          options: { parentCode: 'TO', type: 'district' },
        }),
      ).to.eventually.deep.equal({
        Tongatapu: [
          {
            orgUnit: 'TO_Tongatapu',
            orgUnitName: 'Tongatapu',
            dataValues: { A: '1' },
          },
        ],
        Niuas: [
          {
            orgUnit: 'TO_Niuas',
            orgUnitName: 'Niuas',
            dataValues: { A: '2' },
          },
          {
            orgUnit: 'TO_Niuas',
            orgUnitName: 'Niuas',
            dataValues: { A: '3' },
          },
        ],
        Haapai: [],
      }));

    it('can handle non-unique org unit names', () => {
      const events = [
        {
          orgUnit: 'NZ_WELLINGTON_CITY',
          orgUnitName: 'Wellington',
          dataValues: { A: '1' },
        },
        {
          orgUnit: 'NZ_WELLINGTON_OTHER',
          orgUnitName: 'Other',
          dataValues: { A: '2' },
        }, // same org unit name
        {
          orgUnit: 'NZ_AUCKLAND_OTHER',
          orgUnitName: 'Other',
          dataValues: { A: '3' },
        }, // same org unit name
      ];

      return expect(
        groupEvents(models, events, {
          type: 'allOrgUnitNames',
          options: { parentCode: 'NZ', type: 'district' },
        }),
      ).to.eventually.deep.equal({
        Wellington: [
          {
            orgUnit: 'NZ_WELLINGTON_CITY',
            orgUnitName: 'Wellington',
            dataValues: { A: '1' },
          },
        ],
        'Other (NZ_WELLINGTON_OTHER)': [
          {
            orgUnit: 'NZ_WELLINGTON_OTHER',
            orgUnitName: 'Other',
            dataValues: { A: '2' },
          },
        ],
        'Other (NZ_AUCKLAND_OTHER)': [
          {
            orgUnit: 'NZ_AUCKLAND_OTHER',
            orgUnitName: 'Other',
            dataValues: { A: '3' },
          },
        ],
      });
    });
  });

  describe('type: allOrgUnitParentNames', () => {
    it('groups', () => {
      const events = [
        {
          orgUnit: 'MLB_C',
          orgUnitName: 'Collingwood',
          dataValues: { A: '1' },
        },
        { orgUnit: 'SYD_U', orgUnitName: 'Ultimo', dataValues: { A: '2' } },
        { orgUnit: 'SYD_U', orgUnitName: 'Ultimo', dataValues: { A: '3' } },
      ];

      expect(
        groupEvents(models, events, {
          type: 'allOrgUnitParentNames',
          options: { parentCode: 'AU1', type: 'district' },
        }),
      ).to.eventually.deep.equal({
        Melbourne: [
          {
            orgUnit: 'MLB_C',
            orgUnitName: 'Collingwood',
            dataValues: { A: '1' },
          },
        ],
        Sydney: [
          {
            orgUnit: 'SYD_U',
            orgUnitName: 'Ultimo',
            dataValues: { A: '2' },
          },
          {
            orgUnit: 'SYD_U',
            orgUnitName: 'Ultimo',
            dataValues: { A: '3' },
          },
        ],
      });
    });

    it('can handle non-unique org unit names', () => {
      const events = [
        {
          orgUnit: 'MLB_C',
          orgUnitName: 'Collingwood',
          dataValues: { A: '1' },
        },
        { orgUnit: 'SYD_U', orgUnitName: 'Ultimo', dataValues: { A: '2' } },
      ];

      expect(
        groupEvents(models, events, {
          type: 'allOrgUnitParentNames',
          options: { parentCode: 'AU2', type: 'district' },
        }),
      ).to.eventually.deep.equal({
        'Other (MLB)': [
          {
            orgUnit: 'MLB_C',
            orgUnitName: 'Collingwood',
            dataValues: { A: '1' },
          },
        ],
        'Other (SYD)': [
          {
            orgUnit: 'SYD_U',
            orgUnitName: 'Ultimo',
            dataValues: { A: '2' },
          },
        ],
      });
    });

    it('can handle non-unique child org unit names', () => {
      const events = [
        {
          orgUnit: 'MLB_C',
          orgUnitName: 'Collingwood',
          dataValues: { A: '1' },
        },
        { orgUnit: 'SYD_U', orgUnitName: 'Ultimo', dataValues: { A: '2' } },
        { orgUnit: 'MLB_O', orgUnitName: 'Other', dataValues: { A: '3' } }, // same child org unit name
        { orgUnit: 'SYD_O', orgUnitName: 'Other', dataValues: { A: '4' } }, // same child org unit name
      ];

      expect(
        groupEvents(models, events, {
          type: 'allOrgUnitParentNames',
          options: { parentCode: 'AU3', type: 'district' },
        }),
      ).to.eventually.deep.equal({
        Melbourne: [
          {
            orgUnit: 'MLB_C',
            orgUnitName: 'Collingwood',
            dataValues: { A: '1' },
          },
          {
            orgUnit: 'MLB_O',
            orgUnitName: 'Other',
            dataValues: { A: '3' },
          },
        ],
        Sydney: [
          {
            orgUnit: 'SYD_U',
            orgUnitName: 'Ultimo',
            dataValues: { A: '2' },
          },
          {
            orgUnit: 'SYD_O',
            orgUnitName: 'Other',
            dataValues: { A: '4' },
          },
        ],
      });
    });
  });

  describe('type: dataValues', () => {
    const events = [
      { dataValues: { A: '10', B: '20' } },
      { dataValues: { A: '10', B: '21' } },
      { dataValues: { C: '30' } },
    ];

    it('groups', () =>
      expect(
        groupEvents(models, events, {
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
            dataValues: { A: '10', B: '20' },
          },
          { dataValues: { A: '10', B: '21' } },
        ],
        GROUPING_2: [
          {
            dataValues: { A: '10', B: '21' },
          },
        ],
      }));

    it('uses a union type condition check', () =>
      expect(
        groupEvents(models, events, {
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
            dataValues: { A: '10', B: '21' },
          },
        ],
      }));
  });
});
