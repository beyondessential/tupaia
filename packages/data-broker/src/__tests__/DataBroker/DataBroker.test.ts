/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { DataBroker } from '../../DataBroker';
import { Service } from '../../services/Service';
import { DataElement, ServiceType } from '../../types';
import { DATA_SOURCE_TYPES } from '../../utils';
import { DATA_BY_SERVICE, DATA_ELEMENTS, DATA_GROUPS } from './DataBroker.fixtures';
import { stubCreateService, createModelsStub, MockService } from './DataBroker.stubs';
import { DataServiceMapping } from '../../services/DataServiceMapping';

const mockModels = createModelsStub();

jest.mock('@tupaia/database', () => ({
  modelClasses: {
    DataSource: () => {},
  },
  TupaiaDatabase: jest.fn().mockImplementation(() => {}),
  ModelRegistry: jest.fn().mockImplementation(() => mockModels),
  createModelsStub: jest.requireActual('@tupaia/database').createModelsStub, // don't mock needed testUtility
  TYPES: jest.requireActual('@tupaia/database').TYPES, // don't mock needed type
}));

jest.mock('@tupaia/server-boilerplate', () => ({
  ApiConnection: jest.fn().mockImplementation(() => {}),
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
    type MethodUnderTest = 'push' | 'pull' | 'delete' | 'pullMetadata';

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
        ['pull', 1, [{ code: 'DHIS_01', type: 'dataElement' }, TO_OPTIONS], 'dhis'],
        ['pull', 2, [{ code: 'DHIS_PROGRAM_01', type: 'dataGroup' }, TO_OPTIONS], 'dhis'],
        ['pullMetadata', 1, [{ code: 'DHIS_01', type: 'dataElement' }, TO_OPTIONS], 'dhis'],
        ['pullMetadata', 2, [{ code: 'DHIS_PROGRAM_01', type: 'dataGroup' }, TO_OPTIONS], 'dhis'],
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
        ['pull', 1, [{ code: 'DHIS_01', type: 'dataElement' }, NO_OU_OPT], 'dhis'],
        ['pull', 2, [{ code: 'DHIS_PROGRAM_01', type: 'dataGroup' }, NO_OU_OPT], 'dhis'],
        ['pullMetadata', 1, [{ code: 'DHIS_01', type: 'dataElement' }, NO_OU_OPT], 'dhis'],
        ['pullMetadata', 2, [{ code: 'DHIS_PROGRAM_01', type: 'dataGroup' }, NO_OU_OPT], 'dhis'],
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
        ['pull', [{ code: 'MAPPED_01', type: 'dataElement' }, FJ_OPTIONS], 'tupaia'],
        ['pullMetadata', [{ code: 'MAPPED_01', type: 'dataElement' }, FJ_OPTIONS], 'tupaia'],
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
      const mapping = new DataServiceMapping([
        { dataSource: DATA_ELEMENTS.DHIS_01, service_type: 'dhis', config: {} },
      ]);

      const testData: [MethodUnderTest, any[], DataServiceMapping][] = [
        ['push', [{ code: 'DHIS_01', type: 'dataElement' }, [{ value: 2 }], TO_OPTIONS], mapping],
        ['delete', [{ code: 'DHIS_01', type: 'dataElement' }, { value: 2 }, TO_OPTIONS], mapping],
        ['pull', [{ code: 'DHIS_01', type: 'dataElement' }, TO_OPTIONS], mapping],
        ['pullMetadata', [{ code: 'DHIS_01', type: 'dataElement' }, TO_OPTIONS], mapping],
      ];

      testData.forEach(([methodUnderTest, inputArgs, expectedMapping]) =>
        it(`passes mapping to service: ${methodUnderTest}`, async () => {
          await dataBroker[methodUnderTest](inputArgs[0], inputArgs[1], inputArgs[2]);
          expect(SERVICES.dhis[methodUnderTest]).toHaveBeenCalledOnceWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({ dataServiceMapping: expectedMapping }),
          );
        }),
      );
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
        expect(service.pull).toHaveBeenCalledOnceWith(
          dataElements,
          'dataElement',
          expect.objectContaining({
            organisationUnitCodes: expect.arrayContaining(expectedOrganisationUnitCodes),
          }),
        );

      it('pulls from different data services for the same data element', async () => {
        const dataBroker = new DataBroker();
        const multipleCountryFacilities = ['FJ_FACILITY_01', 'TO_FACILITY_01'];
        await dataBroker.pull(
          { code: ['MAPPED_01', 'MAPPED_02'], type: 'dataElement' },
          { organisationUnitCodes: multipleCountryFacilities },
        );

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

  describe('pull()', () => {
    describe('input validation', () => {
      const testData: [string, Record<string, unknown>, string][] = [
        ['empty object', {}, 'Please provide at least one existing data source code'],
        [
          'no `code` field',
          { type: 'dataElement' },
          'Please provide at least one existing data source code',
        ],
        [
          'code is empty string',
          { code: '' },
          'Please provide at least one existing data source code',
        ],
        [
          'code is empty array',
          { code: [] },
          'Please provide at least one existing data source code',
        ],
        [
          "data element doesn't exist",
          { code: 'NON_EXISTING', type: 'dataElement' },
          'None of the following data elements exist: NON_EXISTING',
        ],
        [
          "data group doesn't exist",
          { code: 'NON_EXISTING', type: 'dataGroup' },
          'None of the following data groups exist: NON_EXISTING',
        ],
        [
          'multiple codes, none exists',
          { code: ['NON_EXISTING1', 'NON_EXISTING2'], type: 'dataElement' },
          'None of the following data elements exist: NON_EXISTING1,NON_EXISTING2',
        ],
      ];

      it.each(testData)('%s', async (_, dataSourceSpec, expectedError) =>
        expect(new DataBroker().pull(dataSourceSpec as any, {})).toBeRejectedWith(expectedError),
      );

      it('does not throw if options omitted', async () =>
        expect(new DataBroker().pull({ code: ['DHIS_01'], type: 'dataElement' }, {})).toResolve());

      it('does not throw if at least one code exists', async () =>
        expect(
          new DataBroker().pull({ code: ['DHIS_01', 'NON_EXISTING'], type: 'dataElement' }, {}),
        ).toResolve());
    });

    describe('permissions', () => {
      it("throws an error if fetching for a data element the user doesn't have required permissions for", async () => {
        await expect(
          new DataBroker({ accessPolicy: new AccessPolicy({ DL: ['Public'] }) }).pull(
            {
              code: ['RESTRICTED_01'],
              type: 'dataElement',
            },
            {},
          ),
        ).toBeRejectedWith('Missing permissions to the following data elements: RESTRICTED_01');
      });

      it("throws an error if fetching for a data element in an entity the user doesn't have required permissions for", async () => {
        await expect(
          new DataBroker({ accessPolicy: new AccessPolicy({ DL: ['Admin'] }) }).pull(
            {
              code: ['RESTRICTED_01'],
              type: 'dataElement',
            },
            { organisationUnitCodes: ['TO'] },
          ),
        ).toBeRejectedWith('Missing permissions to the following data elements:\nRESTRICTED_01');
      });

      it("throws an error if any of data elements in fetch the user doesn't have required permissions for", async () => {
        await expect(
          new DataBroker({ accessPolicy: new AccessPolicy({ DL: ['Public'] }) }).pull(
            {
              code: ['TEST_01', 'RESTRICTED_01'],
              type: 'dataElement',
            },
            { organisationUnitCodes: ['TO'] },
          ),
        ).toBeRejectedWith(`Missing permissions to the following data elements:\nRESTRICTED_01`);
      });

      it("doesn't throw if the user has BES Admin access", async () => {
        await expect(
          new DataBroker({ accessPolicy: new AccessPolicy({ DL: ['BES Admin'] }) }).pull(
            {
              code: ['RESTRICTED_01'],
              type: 'dataElement',
            },
            { organisationUnitCodes: ['TO'] },
          ),
        ).toResolve();
      });

      it("doesn't throw if the user has access to the data element in the requested entity", async () => {
        const results = await new DataBroker({
          accessPolicy: new AccessPolicy({ TO: ['Admin'] }),
        }).pull(
          {
            code: ['RESTRICTED_01'],
            type: 'dataElement',
          },
          { organisationUnitCodes: ['TO'] },
        );
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
        }).pull(
          {
            code: ['RESTRICTED_01'],
            type: 'dataElement',
          },
          { organisationUnitCodes: ['TO', 'FJ'] },
        );
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

    describe('analytics', () => {
      it('single code', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull({ code: 'DHIS_01', type: 'dataElement' }, options);

        expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
        expect(SERVICES.dhis.pull).toHaveBeenCalledOnceWith(
          [DATA_ELEMENTS.DHIS_01],
          'dataElement',
          expect.objectContaining(options),
        );
        expect(data).toStrictEqual({
          results: [
            {
              analytics: [
                { dataElement: 'DHIS_01', organisationUnit: 'TO', period: '20210101', value: 1 },
              ],
              numAggregationsProcessed: 0,
            },
          ],
          metadata: {
            dataElementCodeToName: { DHIS_01: 'DHIS element 1' },
          },
        });
      });

      it('multiple codes', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull(
          { code: ['DHIS_01', 'DHIS_02'], type: 'dataElement' },
          options,
        );

        expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
        expect(SERVICES.dhis.pull).toHaveBeenCalledOnceWith(
          [DATA_ELEMENTS.DHIS_01, DATA_ELEMENTS.DHIS_02],
          'dataElement',
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
        const data = await dataBroker.pull(
          { code: ['DHIS_01', 'TUPAIA_01', 'DHIS_02'], type: 'dataElement' },
          options,
        );

        expect(createServiceMock).toHaveBeenCalledTimes(2);
        expect(createServiceMock).toHaveBeenCalledWith(mockModels, 'dhis', dataBroker);
        expect(createServiceMock).toHaveBeenCalledWith(mockModels, 'tupaia', dataBroker);
        expect(SERVICES.dhis.pull).toHaveBeenCalledOnceWith(
          [DATA_ELEMENTS.DHIS_01, DATA_ELEMENTS.DHIS_02],
          'dataElement',
          expect.objectContaining(options),
        );
        expect(SERVICES.tupaia.pull).toHaveBeenCalledOnceWith(
          [DATA_ELEMENTS.TUPAIA_01],
          'dataElement',
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

    describe('dataGroups', () => {
      it('single code', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull({ code: 'DHIS_PROGRAM_01', type: 'dataGroup' }, options);

        expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
        expect(SERVICES.dhis.pull).toHaveBeenCalledOnceWith(
          [DATA_GROUPS.DHIS_PROGRAM_01],
          'dataGroup',
          expect.objectContaining(options),
        );
        expect(data).toStrictEqual(DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_PROGRAM_01);
      });

      it('multiple codes', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull(
          { code: ['DHIS_PROGRAM_01', 'DHIS_PROGRAM_02'], type: 'dataGroup' },
          options,
        );

        expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
        expect(SERVICES.dhis.pull).toHaveBeenCalledOnceWith(
          [DATA_GROUPS.DHIS_PROGRAM_01, DATA_GROUPS.DHIS_PROGRAM_02],
          'dataGroup',
          expect.objectContaining(options),
        );
        expect(data).toStrictEqual([
          ...DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_PROGRAM_01,
          ...DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_PROGRAM_02,
        ]);
      });

      it('multiple services', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull(
          { code: ['DHIS_PROGRAM_01', 'TUPAIA_PROGRAM_01', 'DHIS_PROGRAM_02'], type: 'dataGroup' },
          options,
        );

        expect(createServiceMock).toHaveBeenCalledTimes(2);
        expect(createServiceMock).toHaveBeenCalledWith(mockModels, 'dhis', dataBroker);
        expect(createServiceMock).toHaveBeenCalledWith(mockModels, 'tupaia', dataBroker);
        expect(SERVICES.dhis.pull).toHaveBeenCalledOnceWith(
          [DATA_GROUPS.DHIS_PROGRAM_01, DATA_GROUPS.DHIS_PROGRAM_02],
          'dataGroup',
          expect.objectContaining(options),
        );
        expect(SERVICES.tupaia.pull).toHaveBeenCalledOnceWith(
          [DATA_GROUPS.TUPAIA_PROGRAM_01],
          'dataGroup',
          expect.objectContaining(options),
        );
        expect(data).toStrictEqual([
          ...DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_PROGRAM_01,
          ...DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_PROGRAM_02,
          ...DATA_BY_SERVICE.tupaia.eventsByProgram.TUPAIA_PROGRAM_01,
        ]);
      });
    });
  });

  describe('pullMetadata()', () => {
    it('throws if the data sources belong to multiple services', async () => {
      const dataBroker = new DataBroker();
      await expect(
        dataBroker.pullMetadata({ code: ['DHIS_01', 'TUPAIA_01'], type: 'dataElement' }),
      ).toBeRejectedWith('Multiple data service types found, only a single service type expected');
    });

    it('single data element', async () => {
      const dataBroker = new DataBroker();
      await dataBroker.pullMetadata({ code: 'DHIS_01', type: 'dataElement' }, options);

      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
      expect(SERVICES.dhis.pullMetadata).toHaveBeenCalledOnceWith(
        [DATA_ELEMENTS.DHIS_01],
        'dataElement',
        expect.objectContaining(options),
      );
    });

    it('multiple data elements', async () => {
      const dataBroker = new DataBroker();
      await dataBroker.pullMetadata({ code: ['DHIS_01', 'DHIS_02'], type: 'dataElement' }, options);

      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
      expect(SERVICES.dhis.pullMetadata).toHaveBeenCalledOnceWith(
        [DATA_ELEMENTS.DHIS_01, DATA_ELEMENTS.DHIS_02],
        'dataElement',
        expect.objectContaining(options),
      );
    });

    it('multiple data groups', async () => {
      const dataBroker = new DataBroker();
      await dataBroker.pullMetadata(
        {
          code: ['DHIS_PROGRAM_01', 'DHIS_PROGRAM_02'],
          type: 'dataGroup',
        },
        options,
      );

      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
      expect(SERVICES.dhis.pullMetadata).toHaveBeenCalledOnceWith(
        [DATA_GROUPS.DHIS_PROGRAM_01, DATA_GROUPS.DHIS_PROGRAM_02],
        'dataGroup',
        expect.objectContaining(options),
      );
    });
  });
});
