/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { MockTupaiaApiClient, MockEntityApi } from '@tupaia/api-client';
import { ReportServerAggregator } from '../../../aggregator';

import { buildContext, ReqContext, updateContext } from '../../../reportBuilder/context';

describe('buildContext', () => {
  const HIERARCHY = 'test_hierarchy';
  const ENTITIES = [
    { code: 'test_hierarchy', name: 'Test Hierarchy', type: 'project' },
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
  ];

  const RELATIONS = {
    test_hierarchy: [
      { parent: 'test_hierarchy', child: 'AU' },
      { parent: 'test_hierarchy', child: 'FJ' },
      { parent: 'test_hierarchy', child: 'KI' },
      { parent: 'test_hierarchy', child: 'TO' },
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
    aggregator: {} as ReportServerAggregator,
    query: {
      hierarchy: HIERARCHY,
      organisationUnitCodes: ['TO'],
    },
  };

  describe('orgUnits', () => {
    it('adds query to the context', async () => {
      const transform: unknown = [];

      const context = await buildContext(transform, reqContext);

      const requestQuery = {
        request: reqContext,
      };
      expect(context).toEqual(expect.objectContaining(requestQuery));
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

      const context = await buildContext(transform, reqContext);
      expect(context).toEqual(expect.objectContaining({ dependencies: ['orgUnits'] }));

      const updatedContext = await updateContext(context, data);
      const orgUnits = {
        orgUnits: [
          { id: 'ouId2', code: 'FJ', name: 'Fiji', attributes: {} },
          { id: 'ouId4', code: 'TO', name: 'Tonga', attributes: {} },
        ],
      };
      expect(updatedContext).toEqual(expect.objectContaining(orgUnits));
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

      const context = await buildContext(transform, reqContext);
      expect(context).toEqual(expect.objectContaining({ dependencies: ['orgUnits'] }));

      const updatedContext = await updateContext(context, data);
      const orgUnits = {
        orgUnits: [
          { id: 'ouId2', code: 'FJ', name: 'Fiji', attributes: {} },
          { id: 'ouId4', code: 'TO', name: 'Tonga', attributes: {} },
        ],
      };
      expect(updatedContext).toEqual(expect.objectContaining(orgUnits));
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

      const context = await buildContext(transform, reqContext);
      expect(context).toEqual(expect.objectContaining({ dependencies: ['orgUnits'] }));

      const updatedContext = await updateContext(context, data);
      const orgUnits = {
        orgUnits: [
          { id: 'ouId5', code: 'TO_Facility1', name: 'Tonga Facility 1', attributes: { x: 1 } },
        ],
      };
      expect(updatedContext).toEqual(expect.objectContaining(orgUnits));
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

      const context = await buildContext(transform, reqContext);
      expect(context).toEqual(expect.objectContaining({ dependencies: ['orgUnits'] }));

      const updatedContext = await updateContext(context, data);
      const orgUnits = {
        orgUnits: [],
      };
      expect(updatedContext).toEqual(expect.objectContaining(orgUnits));
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

      const context = await buildContext(transform, reqContext);
      expect(context).toEqual(expect.objectContaining({ dependencies: ['dataElementCodeToName'] }));

      const updatedContext = await updateContext(context, data);
      const dataElementCodeToName = {
        dataElementCodeToName: { BCD1: 'Facility Status', BCD2: 'Reason for closure' },
      };
      expect(updatedContext).toEqual(expect.objectContaining(dataElementCodeToName));
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

      const context = await buildContext(transform, reqContext);
      expect(context).toEqual(expect.objectContaining({ dependencies: ['dataElementCodeToName'] }));

      const updatedContext = await updateContext(context, data);
      const dataElementCodeToName = { dataElementCodeToName: {} };
      expect(updatedContext).toEqual(expect.objectContaining(dataElementCodeToName));
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

      const context = await buildContext(transform, reqContext);
      expect(context).toEqual(
        expect.objectContaining({ dependencies: ['facilityCountByOrgUnit'] }),
      );

      const updatedContext = await updateContext(context, data);
      const facilityCountByOrgUnit = {
        facilityCountByOrgUnit: {
          TO: 2,
          FJ: 1,
          AU: 0,
        },
      };
      expect(updatedContext).toEqual(expect.objectContaining(facilityCountByOrgUnit));
    });

    it('builds facilityCountByOrgUnit using fetched events', async () => {
      const transform = ['insertNumberOfFacilitiesColumn'];
      const events = [
        { event: 'evId1', eventDate: '2021-01-01T12:00:00', orgUnit: 'TO', orgUnitName: 'Tonga' },
        { event: 'evId2', eventDate: '2021-01-01T12:00:00', orgUnit: 'FJ', orgUnitName: 'Fiji' },
      ];
      const data = { results: events };

      const context = await buildContext(transform, reqContext);
      expect(context).toEqual(
        expect.objectContaining({ dependencies: ['facilityCountByOrgUnit'] }),
      );

      const updatedContext = await updateContext(context, data);
      const facilityCountByOrgUnit = {
        facilityCountByOrgUnit: {
          TO: 2,
          FJ: 1,
        },
      };
      expect(updatedContext).toEqual(expect.objectContaining(facilityCountByOrgUnit));
    });

    it('ignores unknown entities', async () => {
      const transform = ['insertNumberOfFacilitiesColumn'];
      const analytics = [
        { dataElement: 'BCD1', organisationUnit: 'Unknown_entity', period: '20210101', value: 1 },
      ];
      const data = { results: analytics };

      const context = await buildContext(transform, reqContext);
      expect(context).toEqual(
        expect.objectContaining({ dependencies: ['facilityCountByOrgUnit'] }),
      );

      const updatedContext = await updateContext(context, data);
      const facilityCountByOrgUnit = {
        facilityCountByOrgUnit: {},
      };
      expect(updatedContext).toEqual(expect.objectContaining(facilityCountByOrgUnit));
    });
  });
});
