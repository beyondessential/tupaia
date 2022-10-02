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
} from './DataBroker.fixtures';
import {
  Analytic,
  DataBrokerModelRegistry,
  DataElement,
  DataElementMetadata,
  DataGroup,
  DataSource,
  DataSourceType,
  Event,
  ServiceType,
} from '../../types';

export interface ServiceResults {
  analytics: Analytic[];
  eventsByProgram: Record<string, Event[]>;
  dataElements: DataElementMetadata[];
}

export const stubCreateService = (services: Partial<Record<ServiceType, Service>>) =>
  jest.spyOn(CreateService, 'createService').mockImplementation((_, type) => {
    const service = services[type];
    if (!service) {
      throw new Error(`Invalid service type: ${type}`);
    }
    return service;
  });

export const createServiceStub = (
  models: DataBrokerModelRegistry,
  serviceResults: ServiceResults,
) => {
  class MockService extends Service {
    public pull = jest
      .fn()
      .mockImplementation((dataSources: DataSource[], type: DataSourceType) => {
        const { analytics, eventsByProgram, dataElements } = serviceResults;
        const dataSourceCodes = dataSources.map(({ code }) => code);

        switch (type) {
          case 'dataElement': {
            const results = analytics.filter(({ dataElement }) =>
              dataSourceCodes.includes(dataElement),
            );
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
      });

    public push = jest.fn();

    public delete = jest.fn();

    public pullMetadata = jest.fn();
  }

  return new MockService(models);
};

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
