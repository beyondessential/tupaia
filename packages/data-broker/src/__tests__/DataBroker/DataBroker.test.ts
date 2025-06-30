import assert from 'assert';

import { AccessPolicy } from '@tupaia/access-policy';
import { DataBroker } from '../../DataBroker/DataBroker';
import { DataServiceMapping } from '../../services/DataServiceMapping';
import { Service } from '../../services/Service';
import { DataBrokerModelRegistry, DataElement, ServiceType } from '../../types';
import { DATA_SOURCE_TYPES } from '../../utils';
import { DATA_BY_SERVICE, DATA_ELEMENTS, DATA_GROUPS, SYNC_GROUPS } from './DataBroker.fixtures';
import { stubCreateService, createModelsStub, MockService } from './DataBroker.stubs';

const mockModels = createModelsStub();

jest.mock('@tupaia/database', () => ({
  TupaiaDatabase: jest.fn().mockImplementation(() => {}),
  ModelRegistry: jest.fn().mockImplementation(() => mockModels),
  createModelsStub: jest.requireActual('@tupaia/database').createModelsStub, // don't mock needed testUtility
  RECORDS: jest.requireActual('@tupaia/database').RECORDS, // don't mock needed type
}));

jest.mock('../../DataBroker/fetchDataSources', () => ({
  fetchDataElements: async (_models: DataBrokerModelRegistry, codes: string[]) => {
    assert(codes.length > 0);
    const results = Object.values(DATA_ELEMENTS).filter(({ code }) => codes.includes(code));
    assert(results.length > 0);
    return results;
  },
  fetchDataGroups: async (_models: DataBrokerModelRegistry, codes: string[]) => {
    assert(codes.length > 0);
    const results = Object.values(DATA_GROUPS).filter(({ code }) => codes.includes(code));
    assert(results.length > 0);
    return results;
  },
  fetchSyncGroups: async (_models: DataBrokerModelRegistry, codes: string[]) => {
    assert(codes.length > 0);
    const results = Object.values(SYNC_GROUPS).filter(({ code }) => codes.includes(code));
    assert(results.length > 0);
    return results;
  },
}));

describe('DataBroker', () => {
  const SERVICES = {
    dhis: new MockService(mockModels).setMockData(DATA_BY_SERVICE.dhis),
    tupaia: new MockService(mockModels).setMockData(DATA_BY_SERVICE.tupaia),
  };
  const createServiceMock = stubCreateService(SERVICES);
  const options = { organisationUnitCodes: ['TO'] };

  it('getDataSourceTypes()', () => {
    expect(new DataBroker().getDataSourceTypes()).toStrictEqual(DATA_SOURCE_TYPES);
  });

  describe('Data service resolution', () => {
    type MethodUnderTest =
      | 'push'
      | 'pullAnalytics'
      | 'pullEvents'
      | 'delete'
      | 'pullDataElements'
      | 'pullDataGroup';

    const TO_OPTIONS = { organisationUnitCode: 'TO_FACILITY_01' };
    const FJ_OPTIONS = { organisationUnitCode: 'FJ_FACILITY_01' };

    describe('default', () => {
      const testData: [MethodUnderTest, number, any[], ServiceType][] = [
        ['push', 1, [{ code: 'DHIS_01', type: 'dataElement' }, [{ value: 2 }]], 'dhis'],
        ['push', 2, [{ code: 'DHIS_PROGRAM_01', type: 'dataGroup' }, [{ value: 2 }]], 'dhis'],
        ['push', 3, [{ code: 'DHIS_01', type: 'dataElement' }, [{ value: 2 }], TO_OPTIONS], 'dhis'],
        [
          'push',
          4,
          [{ code: 'DHIS_PROGRAM_01', type: 'dataGroup' }, [{ value: 2 }], TO_OPTIONS],
          'dhis',
        ],
        ['delete', 1, [{ code: 'DHIS_01', type: 'dataElement' }, TO_OPTIONS], 'dhis'],
        ['delete', 2, [{ code: 'DHIS_PROGRAM_01', type: 'dataGroup' }, TO_OPTIONS], 'dhis'],
        ['pullAnalytics', 1, ['DHIS_01', TO_OPTIONS], 'dhis'],
        ['pullEvents', 2, ['DHIS_PROGRAM_01', TO_OPTIONS], 'dhis'],
        ['pullDataElements', 1, [['DHIS_01'], TO_OPTIONS], 'dhis'],
        ['pullDataGroup', 2, ['DHIS_PROGRAM_01', TO_OPTIONS], 'dhis'],
      ];

      testData.forEach(([methodUnderTest, testNum, inputArgs, expectedServiceNameUsed]) =>
        it(`resolves the default service: ${methodUnderTest}-${testNum}`, async () => {
          // The default service being the one specified on the de/dg rather than the country mapping tables
          const dataBroker = new DataBroker();
          await dataBroker[methodUnderTest](inputArgs[0], inputArgs[1], inputArgs[2]);
          expect(createServiceMock).toHaveBeenCalledOnceWith(
            expect.anything(),
            expectedServiceNameUsed,
            expect.anything(),
          );
        }),
      );
    });

    describe('no org unit', () => {
      const NO_OU_OPT = {};

      const testData: [MethodUnderTest, number, any[], ServiceType][] = [
        ['push', 1, [{ code: 'DHIS_01', type: 'dataElement' }, [{ value: 2 }]], 'dhis'],
        ['push', 2, [{ code: 'DHIS_PROGRAM_01', type: 'dataGroup' }, [{ value: 2 }]], 'dhis'],
        ['push', 3, [{ code: 'DHIS_01', type: 'dataElement' }, [{ value: 2 }], NO_OU_OPT], 'dhis'],
        [
          'push',
          4,
          [{ code: 'DHIS_PROGRAM_01', type: 'dataGroup' }, [{ value: 2 }], NO_OU_OPT],
          'dhis',
        ],
        ['delete', 1, [{ code: 'DHIS_01', type: 'dataElement' }, NO_OU_OPT], 'dhis'],
        ['delete', 2, [{ code: 'DHIS_PROGRAM_01', type: 'dataGroup' }, NO_OU_OPT], 'dhis'],
        ['pullAnalytics', 1, ['DHIS_01', NO_OU_OPT], 'dhis'],
        ['pullEvents', 1, ['DHIS_PROGRAM_01', NO_OU_OPT], 'dhis'],
        ['pullDataElements', 1, [['DHIS_01'], NO_OU_OPT], 'dhis'],
        ['pullDataGroup', 1, ['DHIS_PROGRAM_01'], 'dhis'],
      ];

      testData.forEach(([methodUnderTest, testNum, inputArgs, expectedServiceNameUsed]) =>
        it(`resolves the default service: ${methodUnderTest}-${testNum}`, async () => {
          // The default service being the one specified on the de/dg rather than the country mapping tables
          const dataBroker = new DataBroker();
          await dataBroker[methodUnderTest](inputArgs[0], inputArgs[1], inputArgs[2]);
          expect(createServiceMock).toHaveBeenCalledOnceWith(
            expect.anything(),
            expectedServiceNameUsed,
            expect.anything(),
          );
        }),
      );
    });

    describe('mapped by country', () => {
      // Only DataElements currently support mapping by country
      const testData: [MethodUnderTest, any[], ServiceType][] = [
        [
          'push',
          [{ code: 'MAPPED_01', type: 'dataElement' }, [{ value: 2 }], FJ_OPTIONS],
          'tupaia',
        ],
        [
          'delete',
          [{ code: 'MAPPED_01', type: 'dataElement' }, { value: 2 }, FJ_OPTIONS],
          'tupaia',
        ],
        ['pullAnalytics', ['MAPPED_01', FJ_OPTIONS], 'tupaia'],
        ['pullDataElements', [['MAPPED_01'], FJ_OPTIONS], 'tupaia'],
      ];

      testData.forEach(([methodUnderTest, inputArgs, expectedServiceType]) =>
        it(`resolves the data service based on mapping: ${methodUnderTest}`, async () => {
          const dataBroker = new DataBroker();
          await dataBroker[methodUnderTest](inputArgs[0], inputArgs[1], inputArgs[2]);
          expect(createServiceMock).toHaveBeenCalledOnceWith(
            expect.anything(),
            expectedServiceType,
            expect.anything(),
          );
        }),
      );
    });

    describe('passes mapping to service', () => {
      const dataBroker = new DataBroker();

      it('passes mapping to service: push', async () => {
        const expectedMapping = new DataServiceMapping([
          { dataSource: DATA_ELEMENTS.DHIS_01, service_type: 'dhis', config: {} },
        ]);

        await dataBroker.push({ code: 'DHIS_01', type: 'dataElement' }, [{ value: 2 }], TO_OPTIONS);
        expect(SERVICES.dhis.push).toHaveBeenCalledOnceWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({ dataServiceMapping: expectedMapping }),
        );
      });

      it('passes mapping to service: delete', async () => {
        const expectedMapping = new DataServiceMapping([
          { dataSource: DATA_ELEMENTS.DHIS_01, service_type: 'dhis', config: {} },
        ]);

        await dataBroker.delete({ code: 'DHIS_01', type: 'dataElement' }, { value: 2 }, TO_OPTIONS);
        expect(SERVICES.dhis.delete).toHaveBeenCalledOnceWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({ dataServiceMapping: expectedMapping }),
        );
      });

      it('passes mapping to service: pullAnalytics', async () => {
        const expectedMapping = new DataServiceMapping([
          { dataSource: DATA_ELEMENTS.DHIS_01, service_type: 'dhis', config: {} },
        ]);

        await dataBroker.pullAnalytics(['DHIS_01'], TO_OPTIONS);
        expect(SERVICES.dhis.pullAnalytics).toHaveBeenCalledOnceWith(
          expect.anything(),
          expect.objectContaining({ dataServiceMapping: expectedMapping }),
        );
      });

      it('passes mapping to service: pullDataElements', async () => {
        const expectedMapping = new DataServiceMapping([
          { dataSource: DATA_ELEMENTS.DHIS_01, service_type: 'dhis', config: {} },
        ]);

        await dataBroker.pullDataElements(['DHIS_01'], TO_OPTIONS);
        expect(SERVICES.dhis.pullMetadata).toHaveBeenCalledOnceWith(
          expect.anything(),
          'dataElement',
          expect.objectContaining({ dataServiceMapping: expectedMapping }),
        );
      });

      it('passes mapping to service: pullDataGroup', async () => {
        const expectedMapping = new DataServiceMapping(
          [],
          [{ dataSource: DATA_GROUPS.DHIS_PROGRAM_01, service_type: 'dhis', config: {} }],
        );

        await dataBroker.pullDataGroup('DHIS_PROGRAM_01', TO_OPTIONS);
        expect(SERVICES.dhis.pullMetadata).toHaveBeenCalledOnceWith(
          expect.anything(),
          'dataGroup',
          expect.objectContaining({ dataServiceMapping: expectedMapping }),
        );
      });
    });

    describe('multiple org units pull', () => {
      // When pulling we can specify multiple org units and this triggers some special logic.
      //
      // For each data element, a different data service can be defined per country, see
      // "mapped by country" above. If the org units are in different countries, then a data
      // element could resolve to multiple services. E.g. Data Element Patient_Age could be
      // in DHIS-tonga for Tonga, and in Superset-Fiji for Fiji. This logic then
      // attempts to minimise the number of calls to any one service type, in the example
      // above there should only be one call to DHIS and one to Superset.
      //
      // Note: all resulting pull calls to a data service are given ALL org unit codes and
      // ALL data element codes. Some data services are ok with this, and some will throw
      // an error if the org unit / data element does not exist there.

      const assertServicePulledDataElementsOnce = (
        service: Service,
        dataElements: DataElement[],
        expectedOrganisationUnitCodes: string[],
      ) =>
        expect(service.pullAnalytics).toHaveBeenCalledOnceWith(
          dataElements,
          expect.objectContaining({
            organisationUnitCodes: expect.arrayContaining(expectedOrganisationUnitCodes),
          }),
        );

      it('pulls from different data services for the same data element', async () => {
        const dataBroker = new DataBroker();
        const multipleCountryFacilities = ['FJ_FACILITY_01', 'TO_FACILITY_01'];
        await dataBroker.pullAnalytics(['MAPPED_01', 'MAPPED_02'], {
          organisationUnitCodes: multipleCountryFacilities,
        });

        expect(createServiceMock).toHaveBeenCalledTimes(2);
        expect(createServiceMock).toHaveBeenCalledWith(
          expect.anything(),
          'dhis',
          expect.anything(),
        );
        expect(createServiceMock).toHaveBeenCalledWith(
          expect.anything(),
          'tupaia',
          expect.anything(),
        );

        assertServicePulledDataElementsOnce(
          SERVICES.dhis,
          [DATA_ELEMENTS.MAPPED_01, DATA_ELEMENTS.MAPPED_02], // all data elements
          multipleCountryFacilities, // all org units
        );
        assertServicePulledDataElementsOnce(
          SERVICES.tupaia,
          [DATA_ELEMENTS.MAPPED_01, DATA_ELEMENTS.MAPPED_02], // all data elements
          multipleCountryFacilities, // all org units
        );
      });
    });
  });

  describe('push()', () => {
    it('throws if the data sources belong to multiple services', async () => {
      const data = [{ value: 1 }, { value: 2 }];
      const dataBroker = new DataBroker();
      return expect(
        dataBroker.push({ code: ['DHIS_01', 'TUPAIA_01'], type: 'dataElement' }, data),
      ).toBeRejectedWith('Multiple data service types found, only a single service type expected');
    });

    it('single code', async () => {
      const data = [{ value: 2 }];
      const dataBroker = new DataBroker();
      await dataBroker.push({ code: 'DHIS_01', type: 'dataElement' }, data);
      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
      expect(SERVICES.dhis.push).toHaveBeenCalledOnceWith(
        [DATA_ELEMENTS.DHIS_01],
        data,
        expect.objectContaining({ type: 'dataElement' }),
      );
    });

    it('multiple codes', async () => {
      const data = [{ value: 1 }, { value: 2 }];
      const dataBroker = new DataBroker();
      await dataBroker.push({ code: ['DHIS_01', 'DHIS_02'], type: 'dataElement' }, data);
      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
      expect(SERVICES.dhis.push).toHaveBeenCalledOnceWith(
        [DATA_ELEMENTS.DHIS_01, DATA_ELEMENTS.DHIS_02],
        data,
        expect.objectContaining({ type: 'dataElement' }),
      );
    });
  });

  describe('delete()', () => {
    it('single code', async () => {
      const data = { value: 2 };
      const dataBroker = new DataBroker();
      await dataBroker.delete({ code: 'DHIS_01', type: 'dataElement' }, data, options);
      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
      expect(SERVICES.dhis.delete).toHaveBeenCalledOnceWith(
        DATA_ELEMENTS.DHIS_01,
        data,
        expect.objectContaining({
          type: 'dataElement',
          ...options,
        }),
      );
    });
  });

  describe('pull permissions', () => {
    it("throws an error if fetching for a data element the user doesn't have required permissions for", async () => {
      await expect(
        new DataBroker({ accessPolicy: new AccessPolicy({ DL: ['Public'] }) }).pullAnalytics(
          ['RESTRICTED_01'],
          {},
        ),
      ).toBeRejectedWith('Missing permissions to the following data elements: RESTRICTED_01');
    });

    it("throws an error if fetching for a data element in an entity the user doesn't have required permissions for", async () => {
      await expect(
        new DataBroker({ accessPolicy: new AccessPolicy({ DL: ['Admin'] }) }).pullAnalytics(
          ['RESTRICTED_01'],
          { organisationUnitCodes: ['TO'] },
        ),
      ).toBeRejectedWith('Missing permissions to the following data elements:\nRESTRICTED_01');
    });

    it("throws an error if any of data elements in fetch the user doesn't have required permissions for", async () => {
      await expect(
        new DataBroker({ accessPolicy: new AccessPolicy({ TO: ['Public'] }) }).pullAnalytics(
          ['TUPAIA_01', 'RESTRICTED_01'],
          { organisationUnitCodes: ['TO'] },
        ),
      ).toBeRejectedWith(`Missing permissions to the following data elements:\nRESTRICTED_01`);
    });

    it("doesn't throw if the user has BES Admin access", async () => {
      await expect(
        new DataBroker({ accessPolicy: new AccessPolicy({ DL: ['BES Admin'] }) }).pullAnalytics(
          ['RESTRICTED_01'],
          { organisationUnitCodes: ['TO'] },
        ),
      ).toResolve();
    });

    it("doesn't throw if the user has access to the data element in the requested entity", async () => {
      const results = await new DataBroker({
        accessPolicy: new AccessPolicy({ TO: ['Admin'] }),
      }).pullAnalytics(['RESTRICTED_01'], { organisationUnitCodes: ['TO'] });
      expect(results).toEqual({
        results: [
          {
            analytics: [
              {
                dataElement: 'RESTRICTED_01',
                organisationUnit: 'TO',
                period: '20210101',
                value: 4,
              },
            ],
            numAggregationsProcessed: 0,
          },
        ],
        metadata: {
          dataElementCodeToName: {},
        },
      });
    });

    it('just returns data for entities that the user have appropriate access to', async () => {
      const results = await new DataBroker({
        accessPolicy: new AccessPolicy({ FJ: ['Admin'] }),
      }).pullAnalytics(['RESTRICTED_01'], { organisationUnitCodes: ['TO', 'FJ'] });
      expect(results).toEqual({
        results: [
          {
            analytics: [
              {
                dataElement: 'RESTRICTED_01',
                organisationUnit: 'FJ',
                period: '20210101',
                value: 5,
              },
            ],
            numAggregationsProcessed: 0,
          },
        ],
        metadata: {
          dataElementCodeToName: {},
        },
      });
    });
  });

  describe('pullAnalytics()', () => {
    it('same service', async () => {
      const dataBroker = new DataBroker();
      const data = await dataBroker.pullAnalytics(['DHIS_01', 'DHIS_02'], options);

      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
      expect(SERVICES.dhis.pullAnalytics).toHaveBeenCalledOnceWith(
        [DATA_ELEMENTS.DHIS_01, DATA_ELEMENTS.DHIS_02],
        expect.objectContaining(options),
      );
      expect(data).toStrictEqual({
        results: [
          {
            analytics: [
              { dataElement: 'DHIS_01', organisationUnit: 'TO', period: '20210101', value: 1 },
              { dataElement: 'DHIS_02', organisationUnit: 'TO', period: '20210101', value: 2 },
            ],
            numAggregationsProcessed: 0,
          },
        ],
        metadata: {
          dataElementCodeToName: { DHIS_01: 'DHIS element 1', DHIS_02: 'DHIS element 2' },
        },
      });
    });

    it('multiple services', async () => {
      const dataBroker = new DataBroker();
      const data = await dataBroker.pullAnalytics(['DHIS_01', 'TUPAIA_01', 'DHIS_02'], options);

      expect(createServiceMock).toHaveBeenCalledTimes(2);
      expect(createServiceMock).toHaveBeenCalledWith(mockModels, 'dhis', dataBroker);
      expect(createServiceMock).toHaveBeenCalledWith(mockModels, 'tupaia', dataBroker);
      expect(SERVICES.dhis.pullAnalytics).toHaveBeenCalledOnceWith(
        [DATA_ELEMENTS.DHIS_01, DATA_ELEMENTS.DHIS_02],
        expect.objectContaining(options),
      );
      expect(SERVICES.tupaia.pullAnalytics).toHaveBeenCalledOnceWith(
        [DATA_ELEMENTS.TUPAIA_01],
        expect.objectContaining(options),
      );
      expect(data).toStrictEqual({
        results: [
          {
            analytics: [
              { dataElement: 'DHIS_01', organisationUnit: 'TO', period: '20210101', value: 1 },
              { dataElement: 'DHIS_02', organisationUnit: 'TO', period: '20210101', value: 2 },
              { dataElement: 'TUPAIA_01', organisationUnit: 'TO', period: '20210101', value: 3 },
            ],
            numAggregationsProcessed: 0,
          },
        ],
        metadata: {
          dataElementCodeToName: {
            DHIS_01: 'DHIS element 1',
            DHIS_02: 'DHIS element 2',
            TUPAIA_01: 'Tupaia element 1',
          },
        },
      });
    });
  });

  describe('pullEvents()', () => {
    it('same service', async () => {
      const dataBroker = new DataBroker();
      const data = await dataBroker.pullEvents(['DHIS_PROGRAM_01', 'DHIS_PROGRAM_02'], options);

      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
      expect(SERVICES.dhis.pullEvents).toHaveBeenCalledOnceWith(
        [DATA_GROUPS.DHIS_PROGRAM_01, DATA_GROUPS.DHIS_PROGRAM_02],
        expect.objectContaining(options),
      );
      expect(data).toStrictEqual([
        ...DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_PROGRAM_01,
        ...DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_PROGRAM_02,
      ]);
    });

    it('multiple services', async () => {
      const dataBroker = new DataBroker();
      const data = await dataBroker.pullEvents(
        ['DHIS_PROGRAM_01', 'TUPAIA_PROGRAM_01', 'DHIS_PROGRAM_02'],
        options,
      );

      expect(createServiceMock).toHaveBeenCalledTimes(2);
      expect(createServiceMock).toHaveBeenCalledWith(mockModels, 'dhis', dataBroker);
      expect(createServiceMock).toHaveBeenCalledWith(mockModels, 'tupaia', dataBroker);
      expect(SERVICES.dhis.pullEvents).toHaveBeenCalledOnceWith(
        [DATA_GROUPS.DHIS_PROGRAM_01, DATA_GROUPS.DHIS_PROGRAM_02],
        expect.objectContaining(options),
      );
      expect(SERVICES.tupaia.pullEvents).toHaveBeenCalledOnceWith(
        [DATA_GROUPS.TUPAIA_PROGRAM_01],
        expect.objectContaining(options),
      );
      expect(data).toStrictEqual([
        ...DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_PROGRAM_01,
        ...DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_PROGRAM_02,
        ...DATA_BY_SERVICE.tupaia.eventsByProgram.TUPAIA_PROGRAM_01,
      ]);
    });
  });

  describe('pullSyncGroupResults()', () => {
    it('same service', async () => {
      const dataBroker = new DataBroker();
      const data = await dataBroker.pullSyncGroupResults(
        ['DHIS_SYNC_GROUP_01', 'DHIS_SYNC_GROUP_02'],
        options,
      );

      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
      expect(SERVICES.dhis.pullSyncGroupResults).toHaveBeenCalledOnceWith(
        [SYNC_GROUPS.DHIS_SYNC_GROUP_01, SYNC_GROUPS.DHIS_SYNC_GROUP_02],
        expect.objectContaining(options),
      );
      expect(data).toStrictEqual({
        DHIS_SYNC_GROUP_01: DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_SYNC_GROUP_01,
        DHIS_SYNC_GROUP_02: DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_SYNC_GROUP_02,
      });
    });

    it('multiple services', async () => {
      const dataBroker = new DataBroker();
      const data = await dataBroker.pullSyncGroupResults(
        ['DHIS_SYNC_GROUP_01', 'TUPAIA_SYNC_GROUP_01', 'DHIS_SYNC_GROUP_02'],
        options,
      );

      expect(createServiceMock).toHaveBeenCalledTimes(2);
      expect(createServiceMock).toHaveBeenCalledWith(mockModels, 'dhis', dataBroker);
      expect(createServiceMock).toHaveBeenCalledWith(mockModels, 'tupaia', dataBroker);
      expect(SERVICES.dhis.pullSyncGroupResults).toHaveBeenCalledOnceWith(
        [SYNC_GROUPS.DHIS_SYNC_GROUP_01, SYNC_GROUPS.DHIS_SYNC_GROUP_02],
        expect.objectContaining(options),
      );
      expect(SERVICES.tupaia.pullSyncGroupResults).toHaveBeenCalledOnceWith(
        [SYNC_GROUPS.TUPAIA_SYNC_GROUP_01],
        expect.objectContaining(options),
      );
      expect(data).toStrictEqual({
        DHIS_SYNC_GROUP_01: DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_SYNC_GROUP_01,
        DHIS_SYNC_GROUP_02: DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_SYNC_GROUP_02,
        TUPAIA_SYNC_GROUP_01: DATA_BY_SERVICE.tupaia.eventsByProgram.TUPAIA_SYNC_GROUP_01,
      });
    });
  });

  describe('pullDataElements()', () => {
    it('throws if the data elements belong to multiple services', async () => {
      const dataBroker = new DataBroker();
      await expect(dataBroker.pullDataElements(['DHIS_01', 'TUPAIA_01'])).toBeRejectedWith(
        'Multiple data service types found, only a single service type expected',
      );
    });

    it('pulls data elements', async () => {
      const dataBroker = new DataBroker();
      await dataBroker.pullDataElements(['DHIS_01', 'DHIS_02'], options);

      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
      expect(SERVICES.dhis.pullMetadata).toHaveBeenCalledOnceWith(
        [DATA_ELEMENTS.DHIS_01, DATA_ELEMENTS.DHIS_02],
        'dataElement',
        expect.objectContaining(options),
      );
    });
  });

  describe('pullDataGroup()', () => {
    it('pulls data group', async () => {
      const dataBroker = new DataBroker();
      await dataBroker.pullDataGroup('DHIS_PROGRAM_01', options);

      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
      expect(SERVICES.dhis.pullMetadata).toHaveBeenCalledOnceWith(
        [DATA_GROUPS.DHIS_PROGRAM_01],
        'dataGroup',
        expect.objectContaining(options),
      );
    });
  });
});
