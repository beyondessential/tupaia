/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataBroker } from '../../DataBroker';
import { Service } from '../../services/Service';
import { DataSource } from '../../types';
import { DATA_SOURCE_TYPES } from '../../utils';
import { DATA_BY_SERVICE, DATA_ELEMENTS, DATA_GROUPS } from './DataBroker.fixtures';
import { stubCreateService, createModelsStub, createServiceStub } from './DataBroker.stubs';

const mockDataElements = Object.values(DATA_ELEMENTS);
const mockDataGroups = Object.values(DATA_GROUPS);
const mockModels = createModelsStub(mockDataElements, mockDataGroups);

jest.mock('@tupaia/database', () => ({
  modelClasses: {
    DataSource: () => {},
  },
  TupaiaDatabase: jest.fn().mockImplementation(() => {}),
  ModelRegistry: jest.fn().mockImplementation(() => mockModels),
}));

jest.mock('@tupaia/server-boilerplate', () => ({
  ApiConnection: jest.fn().mockImplementation(() => {}),
}));

describe('DataBroker', () => {
  const SERVICES = {
    dhis: createServiceStub(mockModels, DATA_BY_SERVICE.dhis),
    tupaia: createServiceStub(mockModels, DATA_BY_SERVICE.tupaia),
  };
  const createServiceMock = stubCreateService(SERVICES);
  const options = { ignoreErrors: true, organisationUnitCode: 'TO' };

  it('getDataSourceTypes()', () => {
    expect(new DataBroker().getDataSourceTypes()).toStrictEqual(DATA_SOURCE_TYPES);
  });

  describe('push()', () => {
    it('throws if the data sources belong to multiple services', async () => {
      const data = [{ value: 1 }, { value: 2 }];
      const dataBroker = new DataBroker();
      return expect(
        dataBroker.push({ code: ['DHIS_01', 'TUPAIA_01'], type: 'dataElement' }, data),
      ).toBeRejectedWith('Cannot push data belonging to different services');
    });

    it('single code', async () => {
      const data = [{ value: 2 }];
      const dataBroker = new DataBroker();
      await dataBroker.push({ code: 'DHIS_01', type: 'dataElement' }, data);
      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
      expect(SERVICES.dhis.push).toHaveBeenCalledOnceWith([DATA_ELEMENTS.DHIS_01], data, {
        type: 'dataElement',
      });
    });

    it('multiple codes', async () => {
      const data = [{ value: 1 }, { value: 2 }];
      const dataBroker = new DataBroker();
      await dataBroker.push({ code: ['DHIS_01', 'DHIS_02'], type: 'dataElement' }, data);
      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
      expect(SERVICES.dhis.push).toHaveBeenCalledOnceWith(
        [DATA_ELEMENTS.DHIS_01, DATA_ELEMENTS.DHIS_02],
        data,
        { type: 'dataElement' },
      );
    });
  });

  it('delete()', async () => {
    const data = { value: 2 };
    const dataBroker = new DataBroker();
    await dataBroker.delete({ code: 'DHIS_01', type: 'dataElement' }, data, options);
    expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
    expect(SERVICES.dhis.delete).toHaveBeenCalledOnceWith(DATA_ELEMENTS.DHIS_01, data, {
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
        expect(new DataBroker().pull(dataSourceSpec as any, {})).toBeRejectedWith(expectedError),
      );

      it('does not throw if at least one code exists', async () =>
        expect(
          new DataBroker().pull({ code: ['DHIS_01', 'NON_EXISTING'], type: 'dataElement' }, {}),
        ).toResolve());
    });

    describe('analytics', () => {
      const assertServicePulledDataElementsOnce = (service: Service, dataElements: DataSource[]) =>
        expect(service.pull).toHaveBeenCalledOnceWith(dataElements, 'dataElement', options);

      it('single code', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull({ code: 'DHIS_01', type: 'dataElement' }, options);

        expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
        assertServicePulledDataElementsOnce(SERVICES.dhis, [DATA_ELEMENTS.DHIS_01]);
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
        assertServicePulledDataElementsOnce(SERVICES.dhis, [
          DATA_ELEMENTS.DHIS_01,
          DATA_ELEMENTS.DHIS_02,
        ]);
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
        assertServicePulledDataElementsOnce(SERVICES.dhis, [
          DATA_ELEMENTS.DHIS_01,
          DATA_ELEMENTS.DHIS_02,
        ]);
        assertServicePulledDataElementsOnce(SERVICES.tupaia, [DATA_ELEMENTS.TUPAIA_01]);
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
      const assertServicePulledEventsOnce = (service: Service, dataElements: DataSource[]) =>
        expect(service.pull).toHaveBeenCalledOnceWith(dataElements, 'dataGroup', options);

      it('single code', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull({ code: 'DHIS_PROGRAM_01', type: 'dataGroup' }, options);

        expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
        assertServicePulledEventsOnce(SERVICES.dhis, [DATA_GROUPS.DHIS_PROGRAM_01]);
        expect(data).toStrictEqual(DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_PROGRAM_01);
      });

      it('multiple codes', async () => {
        const dataBroker = new DataBroker();
        const data = await dataBroker.pull(
          { code: ['DHIS_PROGRAM_01', 'DHIS_PROGRAM_02'], type: 'dataGroup' },
          options,
        );

        expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
        assertServicePulledEventsOnce(SERVICES.dhis, [
          DATA_GROUPS.DHIS_PROGRAM_01,
          DATA_GROUPS.DHIS_PROGRAM_02,
        ]);
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
        assertServicePulledEventsOnce(SERVICES.dhis, [
          DATA_GROUPS.DHIS_PROGRAM_01,
          DATA_GROUPS.DHIS_PROGRAM_02,
        ]);
        assertServicePulledEventsOnce(SERVICES.tupaia, [DATA_GROUPS.TUPAIA_PROGRAM_01]);
        expect(data).toStrictEqual([
          ...DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_PROGRAM_01,
          ...DATA_BY_SERVICE.dhis.eventsByProgram.DHIS_PROGRAM_02,
          ...DATA_BY_SERVICE.tupaia.eventsByProgram.TUPAIA_PROGRAM_01,
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
        dataBroker.pullMetadata({ code: ['DHIS_01', 'TUPAIA_01'], type: 'dataElement' }, options),
      ).toBeRejectedWith('Cannot pull metadata for data sources belonging to different services');
    });

    it('single code', async () => {
      const dataBroker = new DataBroker();
      await dataBroker.pullMetadata({ code: 'DHIS_01', type: 'dataElement' }, options);
      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
      assertServicePulledDataElementMetadataOnce(SERVICES.dhis, [DATA_ELEMENTS.DHIS_01]);
    });

    it('multiple codes', async () => {
      const dataBroker = new DataBroker();
      await dataBroker.pullMetadata({ code: ['DHIS_01', 'DHIS_02'], type: 'dataElement' }, options);
      expect(createServiceMock).toHaveBeenCalledOnceWith(mockModels, 'dhis', dataBroker);
      assertServicePulledDataElementMetadataOnce(SERVICES.dhis, [
        DATA_ELEMENTS.DHIS_01,
        DATA_ELEMENTS.DHIS_02,
      ]);
    });
  });
});
