/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createJestMockInstance } from '@tupaia/utils';
import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import * as CreateService from '../../services/createService';
import {
  DATA_ELEMENT_DATA_SERVICES,
  DATA_ELEMENTS,
  DATA_GROUPS,
  ENTITIES,
} from './DataBroker.fixtures';

export const stubCreateService = services =>
  jest.spyOn(CreateService, 'createService').mockImplementation((_, type) => {
    const service = services[type];
    if (!service) {
      throw new Error(`Invalid service type: ${type}`);
    }
    return service;
  });

export const createServiceStub = serviceData => {
  const pull = (dataSources, type) => {
    const dataSourceCodes = dataSources.map(({ code }) => code);
    // Service specs require that data must be pulled for a specific type each time
    const filteredServiceData = serviceData.filter(
      ({ code, type: currentType }) => dataSourceCodes.includes(code) && currentType === type,
    );

    switch (type) {
      case 'dataElement': {
        const data = { results: [], metadata: { dataElementCodeToName: {} } };
        filteredServiceData.forEach(({ code, name, value }) => {
          data.results.push({ value });
          data.metadata.dataElementCodeToName[code] = name;
        });
        return data;
      }
      case 'dataGroup':
        return filteredServiceData.map(({ code, value }) => ({ dataValues: { [code]: value } }));
      default:
        throw new Error(`Invalid data source type: ${type}`);
    }
  };

  return createJestMockInstance('@tupaia/data-broker/src/services/Service', 'Service', { pull });
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
