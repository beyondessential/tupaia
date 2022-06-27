/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataBroker } from '../../DataBroker';
import { Service } from '../../services/Service';
import { DataSource } from '../../types';
import { DATA_BY_SERVICE, DATA_ELEMENTS, DATA_GROUPS } from './DataBroker.fixtures';
import { stubCreateService, createModelsStub, createServiceStub } from './DataBroker.stubs';

const dataElements = Object.values(DATA_ELEMENTS);
const dataGroups = Object.values(DATA_GROUPS);
const mockModels = createModelsStub(dataElements, dataGroups);

jest.mock('@tupaia/database', () => ({
  modelClasses: {
    DataSource: () => {},
  },
  TupaiaDatabase: () => {},
  ModelRegistry: jest.fn().mockImplementation(() => mockModels),
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
  const options = { ignoreErrors: true, organisationUnitCode: 'TO' };

  it('getDataSourceTypes()', () => {
    expect(new DataBroker().getDataSourceTypes()).toStrictEqual(mockModels.dataElement.getTypes());
  });

  describe('push()', () => {
    it('throws if the data sources belong to multiple services', async () => {
      const data = [{ value: 1 }, { value: 2 }];
      const dataBroker = new DataBroker();
      return expect(
        dataBroker.push({ code: ['TEST_01', 'OTHER_01'], type: 'dataElement' }, data),
      ).toBeRejectedWith('Cannot push data belonging to different services');
    });

    it('single code', async () => {
      const data = [{ value: 2 }];
      const dataBroker = new DataBroker();
      await dataBroker.push({ code: 'TEST_01', type: 'dataElement' }, data);
      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'test', dataBroker);
      expect(SERVICES.test.push).toHaveBeenCalledOnceWith([DATA_ELEMENTS.TEST_01], data, {
        type: 'dataElement',
      });
    });

    it('multiple codes', async () => {
      const data = [{ value: 1 }, { value: 2 }];
      const dataBroker = new DataBroker();
      await dataBroker.push({ code: ['TEST_01', 'TEST_02'], type: 'dataElement' }, data);
      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'test', dataBroker);
      expect(SERVICES.test.push).toHaveBeenCalledOnceWith(
        [DATA_ELEMENTS.TEST_01, DATA_ELEMENTS.TEST_02],
        data,
        { type: 'dataElement' },
      );
    });
  });

  it('delete()', async () => {
    const data = { value: 2 };
    const dataBroker = new DataBroker();
    await dataBroker.delete({ code: 'TEST_01', type: 'dataElement' }, data, options);
    expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'test', dataBroker);
    expect(SERVICES.test.delete).toHaveBeenCalledOnceWith(DATA_ELEMENTS.TEST_01, data, {
      type: 'dataElement',
      ...options,
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
        expect(new DataBroker().pull(dataSourceSpec as any)).toBeRejectedWith(expectedError),
      );

      it('does not throw if at least one code exists', async () =>
        expect(
          new DataBroker().pull({ code: ['TEST_01', 'NON_EXISTING'], type: 'dataElement' }),
        ).toResolve());
    });

    describe('analytics', () => {
      const assertServicePulledDataElementsOnce = (service: Service, dataElements: DataSource[]) =>
        expect(service.pull).toHaveBeenCalledOnceWith(dataElements, 'dataElement', options);

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

    describe('events', () => {
      const assertServicePulledEventsOnce = (service: Service, dataElements: DataSource[]) =>
        expect(service.pull).toHaveBeenCalledOnceWith(dataElements, 'dataGroup', options);

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
    const assertServicePulledDataElementMetadataOnce = (
      service: Service,
      dataElements: DataSource[],
    ) =>
      expect(service.pullMetadata).toHaveBeenCalledOnceWith(dataElements, 'dataElement', options);

    it('throws if the data sources belong to multiple services', async () => {
      const dataBroker = new DataBroker();
      return expect(
        dataBroker.pullMetadata({ code: ['TEST_01', 'OTHER_01'], type: 'dataElement' }, options),
      ).toBeRejectedWith('Cannot pull metadata for data sources belonging to different services');
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
  });
});
