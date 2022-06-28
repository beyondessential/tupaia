/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createJestMockInstance } from '@tupaia/utils';
import { DataSourceSpec } from '../../DataBroker';
import * as CreateService from '../../services/createService';
import { Service } from '../../services/Service';
import {
  Analytic,
  AnalyticResults,
  DataElement,
  DataGroup,
  DataSource,
  DataSourceType,
  ServiceType,
} from '../../types';
import { DATA_SOURCE_TYPE } from '../../utils';

export interface ServiceResult {
  code: string;
  type: DataSourceType;
  name: string;
  value: number;
}

export const stubCreateService = (services: Partial<Record<ServiceType, Service>>) =>
  jest.spyOn(CreateService, 'createService').mockImplementation((_, type) => {
    const service = services[type];
    if (!service) {
      throw new Error(`Invalid service type: ${type}`);
    }
    return service;
  });

export const createServiceStub = (serviceData: ServiceResult[]) => {
  const pull = (dataSources: DataSource[], type: DATA_SOURCE_TYPE) => {
    const dataSourceCodes = dataSources.map(({ code }) => code);
    // Service specs require that data must be pulled for a specific type each time
    const filteredServiceData = serviceData.filter(
      ({ code, type: currentType }) => dataSourceCodes.includes(code) && currentType === type,
    );

    switch (type) {
      case 'dataElement': {
        const data: AnalyticResults & { metadata: Required<AnalyticResults['metadata']> } = {
          results: [],
          metadata: { dataElementCodeToName: {} },
        };
        filteredServiceData.forEach(({ code, name, value }) => {
          data.results.push({ value } as Analytic);
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

  return createJestMockInstance('@tupaia/data-broker/src/services/Service', 'Service', {
    pull,
  }) as Service;
};

export const createModelsStub = (dataElements: DataElement[], dataGroups: DataGroup[]) => ({
  dataElement: {
    find: (spec: DataSourceSpec) => dataElements.filter(({ code }) => spec.code.includes(code)),
  },
  dataGroup: {
    find: (spec: DataSourceSpec) => dataGroups.filter(({ code }) => spec.code.includes(code)),
    getDataElementsInDataGroup: () => [],
  },
});
