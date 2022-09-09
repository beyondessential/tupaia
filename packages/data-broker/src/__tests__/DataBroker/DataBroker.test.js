/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataBroker } from '../../DataBroker';
import { DATA_BY_SERVICE, DATA_ELEMENTS, DATA_GROUPS } from './DataBroker.fixtures';
import { stubCreateService, createModelsStub, createServiceStub } from './DataBroker.stubs';
import { DataServiceMapping } from '../../services/DataServiceMapping';

const mockModels = createModelsStub();

jest.mock('@tupaia/database', () => ({
  modelClasses: {
    DataSource: () => {},
  },
  TupaiaDatabase: () => {},
  ModelRegistry: jest.fn().mockImplementation(() => mockModels),
  createModelsStub: jest.requireActual('@tupaia/database').createModelsStub, // don't mock needed testUtility
  TYPES: jest.requireActual('@tupaia/database').TYPES, // don't mock needed type
}));

jest.mock('@tupaia/server-boilerplate', () => ({
  ApiConnection: jest.fn().mockImplementation(() => {}),
}));

describe('DataBroker', () => {
  const SERVICES = {
    test: createServiceStub(DATA_BY_SERVICE.test),
    other: createServiceStub(DATA_BY_SERVICE.other),
  };
  const createServiceMock = stubCreateService(SERVICES);
  const options = { organisationUnitCode: 'TO' };

  it('getDataSourceTypes()', () => {
    expect(new DataBroker().getDataSourceTypes()).toStrictEqual(mockModels.dataElement.getTypes());
  });

  describe('Data service resolution', () => {
    const TO_OPTIONS = { organisationUnitCode: 'TO_FACILITY_01' };
    const FJ_OPTIONS = { organisationUnitCode: 'FJ_FACILITY_01' };

    describe('default', () => {
      const testData = [
        ['push', 1, [{ code: 'TEST_01', type: 'dataElement' }, [{ value: 2 }]], 'test'],
        ['push', 2, [{ code: 'TEST_01', type: 'dataGroup' }, [{ value: 2 }]], 'test'],
        ['push', 3, [{ code: 'TEST_01', type: 'dataElement' }, [{ value: 2 }], TO_OPTIONS], 'test'],
        ['push', 4, [{ code: 'TEST_01', type: 'dataGroup' }, [{ value: 2 }], TO_OPTIONS], 'test'],
        ['delete', 1, [{ code: 'TEST_01', type: 'dataElement' }, TO_OPTIONS], 'test'],
        ['delete', 2, [{ code: 'TEST_01', type: 'dataGroup' }, TO_OPTIONS], 'test'],
        ['pull', 1, [{ code: 'TEST_01', type: 'dataElement' }, TO_OPTIONS], 'test'],
        ['pull', 2, [{ code: 'TEST_01', type: 'dataGroup' }, TO_OPTIONS], 'test'],
        ['pullMetadata', 1, [{ code: 'TEST_01', type: 'dataElement' }, TO_OPTIONS], 'test'],
        ['pullMetadata', 2, [{ code: 'TEST_01', type: 'dataGroup' }, TO_OPTIONS], 'test'],
      ];

      testData.forEach(([methodUnderTest, testNum, inputArgs, expectedServiceNameUsed]) =>
        it(`resolves the default service: ${methodUnderTest}-${testNum}`, async () => {
          // The default service being the one specified on the de/dg rather than the country mapping tables
          const dataBroker = new DataBroker();
          await dataBroker[methodUnderTest].apply(dataBroker, inputArgs);
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
      const testData = [
        ['push', [{ code: 'MAPPED_01', type: 'dataElement' }, [{ value: 2 }], FJ_OPTIONS], 'other'],
        ['delete', [{ code: 'MAPPED_01', type: 'dataElement' }, { value: 2 }, FJ_OPTIONS], 'other'],
        ['pull', [{ code: 'MAPPED_01', type: 'dataElement' }, FJ_OPTIONS], 'other'],
        ['pullMetadata', [{ code: 'MAPPED_01', type: 'dataElement' }, FJ_OPTIONS], 'other'],
      ];

      testData.forEach(([methodUnderTest, inputArgs, expectedServiceType]) =>
        it(`resolves the data service based on mapping: ${methodUnderTest}`, async () => {
          const dataBroker = new DataBroker();
          await dataBroker[methodUnderTest].apply(dataBroker, inputArgs);
          expect(createServiceMock).toHaveBeenCalledOnceWith(
            expect.anything(),
            expectedServiceType,
            expect.anything(),
          );
        }),
      );
    });

    describe('passes mapping to service', () => {
      let dataBroker;
      const FAKE_MAPPING = new DataServiceMapping([
        {
          dataSource: DATA_ELEMENTS.TEST_01,
          service_type: DATA_ELEMENTS.TEST_01.service_type,
          config: DATA_ELEMENTS.TEST_01.config,
        },
      ]);

      const testData = [
        ['push', [{ code: 'TEST_01', type: 'dataElement' }, [{ value: 2 }], TO_OPTIONS]],
        ['delete', [{ code: 'TEST_01', type: 'dataElement' }, { value: 2 }, TO_OPTIONS]],
        ['pull', [{ code: 'TEST_01', type: 'dataElement' }, TO_OPTIONS]],
        ['pullMetadata', [{ code: 'TEST_01', type: 'dataElement' }, TO_OPTIONS]],
      ];

      beforeAll(() => {
        dataBroker = new DataBroker();
        dataBroker.dataServiceResolver = {
          getMappingByOrgUnitCode: jest.fn().mockReturnValue(FAKE_MAPPING),
          getMappingByOrgUnitCodes: jest.fn().mockReturnValue(FAKE_MAPPING),
        };
      });

      testData.forEach(([methodUnderTest, inputArgs]) =>
        it(`passes mapping to service: ${methodUnderTest}`, async () => {
          await dataBroker[methodUnderTest].apply(dataBroker, inputArgs);
          expect(SERVICES.test[methodUnderTest]).toHaveBeenCalledOnceWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({
              dataServiceMapping: FAKE_MAPPING,
            }),
          );
        }),
      );
    });
  });

  describe('push()', () => {
    it('throws if the data sources belong to multiple services', async () => {
      const data = [{ value: 1 }, { value: 2 }];
      const dataBroker = new DataBroker();
      return expect(
        dataBroker.push({ code: ['TEST_01', 'OTHER_01'], type: 'dataElement' }, data),
      ).toBeRejectedWith('Multiple data service types found, only a single service type expected');
    });

    it('single code', async () => {
      const data = [{ value: 2 }];
      const dataBroker = new DataBroker();
      await dataBroker.push({ code: 'TEST_01', type: 'dataElement' }, data);
      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'test', dataBroker);
      expect(SERVICES.test.push).toHaveBeenCalledOnceWith(
        [DATA_ELEMENTS.TEST_01],
        data,
        expect.objectContaining({ type: 'dataElement' }),
      );
    });

    it('multiple codes', async () => {
      const data = [{ value: 1 }, { value: 2 }];
      const dataBroker = new DataBroker();
      await dataBroker.push({ code: ['TEST_01', 'TEST_02'], type: 'dataElement' }, data);
      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'test', dataBroker);
      expect(SERVICES.test.push).toHaveBeenCalledOnceWith(
        [DATA_ELEMENTS.TEST_01, DATA_ELEMENTS.TEST_02],
        data,
        expect.objectContaining({ type: 'dataElement' }),
      );
    });
  });

  describe('delete()', () => {
    it('single code', async () => {
      const data = { value: 2 };
      const dataBroker = new DataBroker();
      await dataBroker.delete({ code: 'TEST_01', type: 'dataElement' }, data, options);
      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'test', dataBroker);
      expect(SERVICES.test.delete).toHaveBeenCalledOnceWith(
        DATA_ELEMENTS.TEST_01,
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
      const testData = [
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
        expect(new DataBroker().pull(dataSourceSpec)).toBeRejectedWith(expectedError),
      );

      it('does not throw if options omitted', async () =>
        expect(new DataBroker().pull({ code: ['TEST_01'], type: 'dataElement' })).toResolve());

      it('does not throw if at least one code exists', async () =>
        expect(
          new DataBroker().pull({ code: ['TEST_01', 'NON_EXISTING'], type: 'dataElement' }),
        ).toResolve());
    });

    describe('analytics', () => {
      const assertServicePulledDataElementsOnce = (service, dataElements) =>
        expect(service.pull).toHaveBeenCalledOnceWith(
          dataElements,
          'dataElement',
          expect.objectContaining(options),
        );

      it('single code', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull({ code: 'TEST_01', type: 'dataElement' }, options);

        expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'test', dataBroker);
        assertServicePulledDataElementsOnce(SERVICES.test, [DATA_ELEMENTS.TEST_01]);
        expect(data).toStrictEqual({
          results: [{ analytics: [{ value: 1 }], numAggregationsProcessed: 0 }],
          metadata: { dataElementCodeToName: { TEST_01: 'Test element 1' } },
        });
      });

      it('multiple codes', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull(
          { code: ['TEST_01', 'TEST_02'], type: 'dataElement' },
          options,
        );

        expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'test', dataBroker);
        assertServicePulledDataElementsOnce(SERVICES.test, [
          DATA_ELEMENTS.TEST_01,
          DATA_ELEMENTS.TEST_02,
        ]);
        expect(data).toStrictEqual({
          results: [{ analytics: [{ value: 1 }, { value: 2 }], numAggregationsProcessed: 0 }],
          metadata: {
            dataElementCodeToName: { TEST_01: 'Test element 1', TEST_02: 'Test element 2' },
          },
        });
      });

      it('multiple services', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull(
          { code: ['TEST_01', 'OTHER_01', 'TEST_02'], type: 'dataElement' },
          options,
        );

        expect(createServiceMock).toHaveBeenCalledTimes(2);
        expect(createServiceMock).toHaveBeenCalledWith(mockModels, 'test', dataBroker);
        expect(createServiceMock).toHaveBeenCalledWith(mockModels, 'other', dataBroker);
        assertServicePulledDataElementsOnce(SERVICES.test, [
          DATA_ELEMENTS.TEST_01,
          DATA_ELEMENTS.TEST_02,
        ]);
        assertServicePulledDataElementsOnce(SERVICES.other, [DATA_ELEMENTS.OTHER_01]);
        expect(data).toStrictEqual({
          results: [
            { analytics: [{ value: 1 }, { value: 2 }, { value: 3 }], numAggregationsProcessed: 0 },
          ],
          metadata: {
            dataElementCodeToName: {
              TEST_01: 'Test element 1',
              TEST_02: 'Test element 2',
              OTHER_01: 'Other element 1',
            },
          },
        });
      });
    });

    describe('dataGroups', () => {
      const assertServicePulledEventsOnce = (service, dataElements) =>
        expect(service.pull).toHaveBeenCalledOnceWith(
          dataElements,
          'dataGroup',
          expect.objectContaining(options),
        );

      it('single code', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull({ code: 'TEST_01', type: 'dataGroup' }, options);

        expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'test', dataBroker);
        assertServicePulledEventsOnce(SERVICES.test, [DATA_GROUPS.TEST_01]);
        expect(data).toStrictEqual([{ dataValues: { TEST_01: 10 } }]);
      });

      it('multiple codes', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull(
          { code: ['TEST_01', 'TEST_02'], type: 'dataGroup' },
          options,
        );

        expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'test', dataBroker);
        assertServicePulledEventsOnce(SERVICES.test, [DATA_GROUPS.TEST_01, DATA_GROUPS.TEST_02]);
        expect(data).toStrictEqual([
          { dataValues: { TEST_01: 10 } },
          { dataValues: { TEST_02: 20 } },
        ]);
      });

      it('multiple services', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull(
          { code: ['TEST_01', 'OTHER_01', 'TEST_02'], type: 'dataGroup' },
          options,
        );

        expect(createServiceMock).toHaveBeenCalledTimes(2);
        expect(createServiceMock).toHaveBeenCalledWith(mockModels, 'test', dataBroker);
        expect(createServiceMock).toHaveBeenCalledWith(mockModels, 'other', dataBroker);
        assertServicePulledEventsOnce(SERVICES.test, [DATA_GROUPS.TEST_01, DATA_GROUPS.TEST_02]);
        assertServicePulledEventsOnce(SERVICES.other, [DATA_GROUPS.OTHER_01]);
        expect(data).toStrictEqual([
          { dataValues: { TEST_01: 10 } },
          { dataValues: { TEST_02: 20 } },
          { dataValues: { OTHER_01: 30 } },
        ]);
      });
    });
  });

  describe('pullMetadata()', () => {
    const assertServicePulledDataElementMetadataOnce = (service, dataSources) =>
      expect(service.pullMetadata).toHaveBeenCalledOnceWith(
        dataSources,
        'dataElement',
        expect.objectContaining(options),
      );

    const assertServicePulledDataGroupMetadataOnce = (service, dataSources) =>
      expect(service.pullMetadata).toHaveBeenCalledOnceWith(
        dataSources,
        'dataGroup',
        expect.objectContaining(options),
      );

    it('throws if the data sources belong to multiple services', async () => {
      const dataBroker = new DataBroker();
      return expect(
        dataBroker.pullMetadata({ code: ['TEST_01', 'OTHER_01'], type: 'dataElement' }, options),
      ).toBeRejectedWith('Multiple data service types found, only a single service type expected');
    });

    it('single code', async () => {
      const dataBroker = new DataBroker();
      await dataBroker.pullMetadata({ code: 'TEST_01', type: 'dataElement' }, options);
      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'test', dataBroker);
      assertServicePulledDataElementMetadataOnce(SERVICES.test, [DATA_ELEMENTS.TEST_01]);
    });

    it('multiple codes', async () => {
      const dataBroker = new DataBroker();
      await dataBroker.pullMetadata({ code: ['TEST_01', 'TEST_02'], type: 'dataElement' }, options);
      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'test', dataBroker);
      assertServicePulledDataElementMetadataOnce(SERVICES.test, [
        DATA_ELEMENTS.TEST_01,
        DATA_ELEMENTS.TEST_02,
      ]);
    });

    it('sends data services when data source type is data group', async () => {
      const dataBroker = new DataBroker();
      await dataBroker.pullMetadata({ code: ['TEST_01', 'TEST_02'], type: 'dataGroup' }, options);
      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'test', dataBroker);
      assertServicePulledDataGroupMetadataOnce(SERVICES.test, [
        DATA_GROUPS.TEST_01,
        DATA_GROUPS.TEST_02,
      ]);
    });
  });
});
