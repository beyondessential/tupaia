/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { MockTupaiaApiClient, MockEntityApi } from '@tupaia/api-client';
import { Row } from '../../../reportBuilder';

import { buildContext, ReqContext } from '../../../reportBuilder/context/buildContext';

describe('buildContext', () => {
  const HIERARCHY = 'test_hierarchy';
  const ENTITIES = {
    test_hierarchy: [
      { id: 'ouId1', code: 'AU', name: 'Australia', type: 'country', attributes: {} },
      { id: 'ouId2', code: 'FJ', name: 'Fiji', type: 'country', attributes: {} },
      { id: 'ouId3', code: 'KI', name: 'Kiribati', type: 'country', attributes: {} },
      { id: 'ouId4', code: 'TO', name: 'Tonga', type: 'country', attributes: {} },
      {
        id: 'ouId5',
        code: 'TO_Facility1',
        name: 'Tonga Facility 1',
        type: 'facility',
        attributes: { x: 1 },
      },
      {
        id: 'ouId6',
        code: 'TO_Facility2',
        name: 'Tonga Facility 2',
        type: 'facility',
        attributes: {},
      },
      { id: 'ouId7', code: 'FJ_Facility', name: 'Fiji Facility', type: 'facility', attributes: {} },
    ],
  };

  const RELATIONS = {
    test_hierarchy: [
      { parent: 'TO', child: 'TO_Facility1' },
      { parent: 'TO', child: 'TO_Facility2' },
      { parent: 'FJ', child: 'FJ_Facility' },
    ],
  };

  const reqContext: ReqContext = {
    hierarchy: HIERARCHY,
    permissionGroup: 'Public',
    services: new MockTupaiaApiClient({
      entity: new MockEntityApi(ENTITIES, RELATIONS),
    }),
    accessPolicy: new AccessPolicy({ AU: ['Public'] }),
  };

  describe('orgUnits', () => {
    it('adds query to the context', async () => {
      const transform: unknown = [];
      const analytics: Row[] = [];
      const data = { results: analytics };
      const query = { test: 'yes' };

      const context = await buildContext(transform, reqContext, data, query);

      const expectedContext = {
        query,
      };
      expect(context).toStrictEqual(expectedContext);
    });

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
          { id: 'ouId2', code: 'FJ', name: 'Fiji', attributes: {} },
          { id: 'ouId4', code: 'TO', name: 'Tonga', attributes: {} },
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
          { id: 'ouId2', code: 'FJ', name: 'Fiji', attributes: {} },
          { id: 'ouId4', code: 'TO', name: 'Tonga', attributes: {} },
        ],
      };
      expect(context).toStrictEqual(expectedContext);
    });

    it('org units include attributes', async () => {
      const transform = [
        {
          insert: {
            name: '=orgUnitCodeToName($organisationUnit)',
          },
          transform: 'updateColumns',
        },
      ];
      const analytics = [
        { dataElement: 'BCD1', organisationUnit: 'TO_Facility1', period: '20210101', value: 1 },
      ];
      const data = { results: analytics };

      const context = await buildContext(transform, reqContext, data);
      const expectedContext = {
        orgUnits: [
          { id: 'ouId5', code: 'TO_Facility1', name: 'Tonga Facility 1', attributes: { x: 1 } },
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

  describe('facilityCountByOrgUnit', () => {
    it('builds facilityCountByOrgUnit using fetched analytics', async () => {
      const transform = ['insertNumberOfFacilitiesColumn'];

      const analytics = [
        { dataElement: 'BCD1', organisationUnit: 'TO', period: '20210101', value: 1 },
        { dataElement: 'BCD1', organisationUnit: 'FJ', period: '20210101', value: 2 },
        { dataElement: 'BCD1', organisationUnit: 'AU', period: '20210101', value: 2 },
      ];
      const data = { results: analytics };

      const context = await buildContext(transform, reqContext, data);
      const expectedContext = {
        facilityCountByOrgUnit: {
          TO: 2,
          FJ: 1,
          AU: 0,
        },
      };
      expect(context).toStrictEqual(expectedContext);
    });

    it('builds facilityCountByOrgUnit using fetched events', async () => {
      const transform = ['insertNumberOfFacilitiesColumn'];
      const events = [
        { event: 'evId1', eventDate: '2021-01-01T12:00:00', orgUnit: 'TO', orgUnitName: 'Tonga' },
        { event: 'evId2', eventDate: '2021-01-01T12:00:00', orgUnit: 'FJ', orgUnitName: 'Fiji' },
      ];
      const data = { results: events };

      const context = await buildContext(transform, reqContext, data);
      const expectedContext = {
        facilityCountByOrgUnit: {
          TO: 2,
          FJ: 1,
        },
      };
      expect(context).toStrictEqual(expectedContext);
    });

    it('ignores unknown entities', async () => {
      const transform = ['insertNumberOfFacilitiesColumn'];
      const analytics = [
        { dataElement: 'BCD1', organisationUnit: 'Unknown_entity', period: '20210101', value: 1 },
      ];
      const data = { results: analytics };

      const context = await buildContext(transform, reqContext, data);
      const expectedContext = {
        facilityCountByOrgUnit: {},
      };
      expect(context).toStrictEqual(expectedContext);
    });
  });
});
