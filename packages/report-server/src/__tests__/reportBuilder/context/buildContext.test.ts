/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import pick from 'lodash.pick';

import { buildContext, ReqContext } from '../../../reportBuilder/context/buildContext';

describe('buildContext', () => {
  const HIERARCHY = 'test_hierarchy';
  const ENTITIES = {
    test_hierarchy: [
      { id: 'ouId1', code: 'AU', name: 'Australia' },
      { id: 'ouId2', code: 'FJ', name: 'Fiji' },
      { id: 'ouId3', code: 'KI', name: 'Kiribati' },
      { id: 'ouId4', code: 'TO', name: 'Tonga' },
    ],
  };

  const entityApiMock = {
    getEntities: async (
      hierarchyName: keyof typeof ENTITIES,
      entityCodes: string[],
      queryOptions: { fields?: string[] } = {},
    ) => {
      const entities = ENTITIES[hierarchyName]?.filter(e => entityCodes.includes(e.code));
      const { fields } = queryOptions;
      return fields ? entities.map(e => pick(e, fields)) : entities;
    },
  };

  const reqContext: ReqContext = {
    hierarchy: HIERARCHY,
    services: {
      entity: entityApiMock,
    } as ReqContext['services'],
  };

  describe('orgUnits', () => {
    it('builds orgUnits using fetched analytics', async () => {
      const transform = [
        {
          insert: {
            name: '=orgUnitCodeToName($organisationUnit)',
          },
          transform: 'updateColumns',
        },
      ];
      const analytics = [
        { dataElement: 'BCD1', organisationUnit: 'TO', period: '20210101', value: 1 },
        { dataElement: 'BCD1', organisationUnit: 'FJ', period: '20210101', value: 2 },
      ];
      const data = { results: analytics };

      const context = await buildContext(transform, reqContext, data);
      const expectedContext = {
        orgUnits: [
          { code: 'FJ', name: 'Fiji' },
          { code: 'TO', name: 'Tonga' },
        ],
      };
      expect(context).toStrictEqual(expectedContext);
    });

    it('builds orgUnits using fetched events', async () => {
      const transform = [
        {
          insert: {
            name: '=orgUnitCodeToName($orgUnit)',
          },
          transform: 'updateColumns',
        },
      ];
      const events = [
        { event: 'evId1', eventDate: '2021-01-01T12:00:00', orgUnit: 'TO', orgUnitName: 'Tonga' },
        { event: 'evId2', eventDate: '2021-01-01T12:00:00', orgUnit: 'FJ', orgUnitName: 'Fiji' },
      ];
      const data = { results: events };

      const context = await buildContext(transform, reqContext, data);
      const expectedContext = {
        orgUnits: [
          { code: 'FJ', name: 'Fiji' },
          { code: 'TO', name: 'Tonga' },
        ],
      };
      expect(context).toStrictEqual(expectedContext);
    });

    it('ignores unknown entities', async () => {
      const transform = [
        {
          insert: {
            name: '=orgUnitCodeToName($organisationUnit)',
          },
          transform: 'updateColumns',
        },
      ];
      const analytics = [
        { dataElement: 'BCD1', organisationUnit: 'Unknown_entity', period: '20210101', value: 1 },
      ];
      const data = { results: analytics };

      const context = await buildContext(transform, reqContext, data);
      const expectedContext = {
        orgUnits: [],
      };
      expect(context).toStrictEqual(expectedContext);
    });
  });

  describe('dataElementCodeToName', () => {
    it('includes dataElementCodeToName from fetched data', async () => {
      const transform = [
        {
          insert: {
            name: '=dataElementCodeToName($dataElement)',
          },
          transform: 'updateColumns',
        },
      ];
      const analytics = [
        { dataElement: 'BCD1', organisationUnit: 'TO', period: '20210101', value: 1 },
        { dataElement: 'BCD2', organisationUnit: 'FJ', period: '20210101', value: 2 },
      ];
      const data = {
        results: analytics,
        metadata: {
          dataElementCodeToName: { BCD1: 'Facility Status', BCD2: 'Reason for closure' },
        },
      };

      const context = await buildContext(transform, reqContext, data);
      const expectedContext = {
        dataElementCodeToName: { BCD1: 'Facility Status', BCD2: 'Reason for closure' },
      };
      expect(context).toStrictEqual(expectedContext);
    });

    it('builds an empty object when using fetch events', async () => {
      const transform = [
        {
          insert: {
            name: '=dataElementCodeToName($dataElement)',
          },
          transform: 'updateColumns',
        },
      ];
      const events = [
        { event: 'evId1', eventDate: '2021-01-01T12:00:00', orgUnit: 'TO', orgUnitName: 'Tonga' },
        { event: 'evId2', eventDate: '2021-01-01T12:00:00', orgUnit: 'FJ', orgUnitName: 'Fiji' },
      ];
      const data = { results: events };

      const context = await buildContext(transform, reqContext, data);
      const expectedContext = { dataElementCodeToName: {} };
      expect(context).toStrictEqual(expectedContext);
    });
  });
});
