/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';
import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import * as CreateService from '../../services/createService';
import { Service } from '../../services/Service';
import {
  DATA_ELEMENT_DATA_SERVICES,
  DATA_ELEMENTS,
  DATA_GROUPS,
  ENTITIES,
  MockServiceData,
} from './DataBroker.fixtures';
import { DataBrokerModelRegistry, DataSource, DataSourceType } from '../../types';

export const stubCreateService = (services: Record<string, Service>) =>
  jest.spyOn(CreateService, 'createService').mockImplementation((_, type) => {
    const service = services[type];
    if (!service) {
      throw new Error(`Invalid service type: ${type}`);
    }
    return service;
  });

export class MockService extends Service {
  private mockData: MockServiceData = {
    analytics: [],
    eventsByProgram: {},
    dataElements: [],
  };

  public constructor(models: DataBrokerModelRegistry) {
    super(models);
  }

  public setMockData(data: MockServiceData) {
    this.mockData = data;
    return this;
  }

  public pull = jest
    .fn()
    .mockImplementation(
      (
        dataSources: DataSource[],
        type: DataSourceType,
        options: { organisationUnitCodes?: string[] },
      ) => {
        const { analytics, eventsByProgram, dataElements } = this.mockData;
        const { organisationUnitCodes } = options;
        const dataSourceCodes = dataSources.map(({ code }) => code);

        switch (type) {
          case 'dataElement': {
            let results = analytics.filter(({ dataElement }) =>
              dataSourceCodes.includes(dataElement),
            );
            if (organisationUnitCodes) {
              results = results.filter(({ organisationUnit }) =>
                organisationUnitCodes.includes(organisationUnit),
              );
            }
            const selectedDataElements = dataElements.filter(({ code }) =>
              dataSourceCodes.includes(code),
            );
            const dataElementCodeToName = reduceToDictionary(selectedDataElements, 'code', 'name');

            return {
              results,
              metadata: {
                dataElementCodeToName,
              },
            };
          }
          case 'dataGroup': {
            return Object.entries(eventsByProgram)
              .filter(([program]) => dataSourceCodes.includes(program))
              .flatMap(([, events]) => events);
          }
          default:
            throw new Error(`Invalid data source type: ${type}`);
        }
      },
    );

  public push = jest.fn();

  public delete = jest.fn();

  public pullMetadata = jest.fn();
}

export const createModelsStub = () => {
  return baseCreateModelsStub({
    dataElement: {
      records: Object.values(DATA_ELEMENTS),
      extraMethods: {
        getTypes: () => ({
          DATA_ELEMENT: 'dataElement',
          DATA_GROUP: 'dataGroup',
          SYNC_GROUP: 'syncGroup',
        }),
      },
    },
    dataGroup: {
      records: Object.values(DATA_GROUPS),
      extraMethods: {
        getDataElementsInDataGroup: () => [],
      },
    },
    entity: {
      records: Object.values(ENTITIES),
    },
    dataElementDataService: {
      records: DATA_ELEMENT_DATA_SERVICES,
    },
  });
};
