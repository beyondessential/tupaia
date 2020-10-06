/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataBroker } from '../../DataBroker';
import * as GetModels from '../../getModels';
import { DATA_BY_SERVICE, DATA_ELEMENTS, DATA_GROUPS } from './DataBroker.fixtures';
import { stubCreateService, createModelsStub, createServiceStub } from './DataBroker.stubs';

describe('DataBroker', () => {
  const dataSources = Object.values(DATA_ELEMENTS).concat(Object.values(DATA_GROUPS));
  const models = createModelsStub(dataSources);
  const SERVICES = {
    test: createServiceStub(DATA_BY_SERVICE.test),
    other: createServiceStub(DATA_BY_SERVICE.other),
  };
  const createServiceMock = stubCreateService(SERVICES);
  const options = { ignoreErrors: true, organisationUnitCode: 'TO' };

  beforeAll(() => {
    jest.spyOn(GetModels, 'getModels').mockReturnValue(models);
  });

  it('getDataSourceTypes()', () => {
    expect(new DataBroker().getDataSourceTypes()).toStrictEqual(models.dataSource.getTypes());
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
      expect(createServiceMock).toHaveBeenCalledOnceWith(models, 'test', dataBroker);
      expect(SERVICES.test.push).toHaveBeenCalledOnceWith([DATA_ELEMENTS.TEST_01], data);
    });

    it('multiple codes', async () => {
      const data = [{ value: 1 }, { value: 2 }];
      const dataBroker = new DataBroker();
      await dataBroker.push({ code: ['TEST_01', 'TEST_02'], type: 'dataElement' }, data);
      expect(createServiceMock).toHaveBeenCalledOnceWith(models, 'test', dataBroker);
      expect(SERVICES.test.push).toHaveBeenCalledOnceWith(
        [DATA_ELEMENTS.TEST_01, DATA_ELEMENTS.TEST_02],
        data,
      );
    });
  });

  it('delete()', async () => {
    const data = { value: 2 };
    const dataBroker = new DataBroker();
    await dataBroker.delete({ code: 'TEST_01', type: 'dataElement' }, data, options);
    expect(createServiceMock).toHaveBeenCalledOnceWith(models, 'test', dataBroker);
    expect(SERVICES.test.delete).toHaveBeenCalledOnceWith(DATA_ELEMENTS.TEST_01, data, options);
  });

  describe('pull()', () => {
    it('should throw an error if no existing code is provided', async () =>
      Promise.all(
        [
          {},
          { type: 'dataElement' },
          { code: '' },
          { code: [] },
          { code: 'NON_EXISTING' },
          { code: ['NON_EXISTING1', 'NON_EXISTING2'] },
        ].map(dataSourceSpec =>
          expect(new DataBroker().pull(dataSourceSpec, options)).toBeRejectedWith(
            /Please provide .*data source/,
          ),
        ),
      ));

    describe('analytics', () => {
      const assertServicePulledDataElementsOnce = (service, dataElements) =>
        expect(service.pull).toHaveBeenCalledOnceWith(dataElements, 'dataElement', options);

      it('single code', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull({ code: 'TEST_01', type: 'dataElement' }, options);

        expect(createServiceMock).toHaveBeenCalledOnceWith(models, 'test', dataBroker);
        assertServicePulledDataElementsOnce(SERVICES.test, [DATA_ELEMENTS.TEST_01]);
        expect(data).toStrictEqual({
          results: [{ value: 1 }],
          metadata: { dataElementCodeToName: { TEST_01: 'Test element 1' } },
        });
      });

      it('multiple codes', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull(
          { code: ['TEST_01', 'TEST_02'], type: 'dataElement' },
          options,
        );

        expect(createServiceMock).toHaveBeenCalledOnceWith(models, 'test', dataBroker);
        assertServicePulledDataElementsOnce(SERVICES.test, [
          DATA_ELEMENTS.TEST_01,
          DATA_ELEMENTS.TEST_02,
        ]);
        expect(data).toStrictEqual({
          results: [{ value: 1 }, { value: 2 }],
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
        expect(createServiceMock).toHaveBeenCalledWith(models, 'test', dataBroker);
        expect(createServiceMock).toHaveBeenCalledWith(models, 'other', dataBroker);
        assertServicePulledDataElementsOnce(SERVICES.test, [
          DATA_ELEMENTS.TEST_01,
          DATA_ELEMENTS.TEST_02,
        ]);
        assertServicePulledDataElementsOnce(SERVICES.other, [DATA_ELEMENTS.OTHER_01]);
        expect(data).toStrictEqual({
          results: [{ value: 1 }, { value: 2 }, { value: 3 }],
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
      const assertServicePulledEventsOnce = (service, dataElements) =>
        expect(service.pull).toHaveBeenCalledOnceWith(dataElements, 'dataGroup', options);

      it('single code', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull({ code: 'TEST_01', type: 'dataGroup' }, options);

        expect(createServiceMock).toHaveBeenCalledOnceWith(models, 'test', dataBroker);
        assertServicePulledEventsOnce(SERVICES.test, [DATA_GROUPS.TEST_01]);
        expect(data).toStrictEqual([{ dataValues: { TEST_01: 10 } }]);
      });

      it('multiple codes', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull(
          { code: ['TEST_01', 'TEST_02'], type: 'dataGroup' },
          options,
        );

        expect(createServiceMock).toHaveBeenCalledOnceWith(models, 'test', dataBroker);
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
        expect(createServiceMock).toHaveBeenCalledWith(models, 'test', dataBroker);
        expect(createServiceMock).toHaveBeenCalledWith(models, 'other', dataBroker);
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
    const assertServicePulledDataElementMetadataOnce = (service, dataElements) =>
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
      expect(createServiceMock).toHaveBeenCalledOnceWith(models, 'test', dataBroker);
      assertServicePulledDataElementMetadataOnce(SERVICES.test, [DATA_ELEMENTS.TEST_01]);
    });

    it('multiple codes', async () => {
      const dataBroker = new DataBroker();
      await dataBroker.pullMetadata({ code: ['TEST_01', 'TEST_02'], type: 'dataElement' }, options);
      expect(createServiceMock).toHaveBeenCalledOnceWith(models, 'test', dataBroker);
      assertServicePulledDataElementMetadataOnce(SERVICES.test, [
        DATA_ELEMENTS.TEST_01,
        DATA_ELEMENTS.TEST_02,
      ]);
    });
  });
});
