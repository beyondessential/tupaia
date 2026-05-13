import { pickBy } from 'es-toolkit/compat';
import { reduceToDictionary } from '@tupaia/utils';
import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import * as CreateService from '../../services/createService';
import { Service } from '../../services/Service';
import { DataBrokerModelRegistry, DataElement, DataGroup, DataServiceSyncGroup } from '../../types';
import {
  DATA_ELEMENT_DATA_SERVICES,
  DATA_ELEMENTS,
  DATA_GROUPS,
  ENTITIES,
  MockServiceData,
  SYNC_GROUPS,
} from './DataBroker.fixtures';

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

  public pullAnalytics = jest
    .fn()
    .mockImplementation(
      (dataElements: DataElement[], options: { organisationUnitCodes?: string[] }) => {
        const { analytics, dataElements: availableDataElements } = this.mockData;
        const { organisationUnitCodes } = options;
        const dataElementCodes = dataElements.map(({ code }) => code);

        let results = analytics.filter(({ dataElement }) => dataElementCodes.includes(dataElement));
        if (organisationUnitCodes) {
          results = results.filter(({ organisationUnit }) =>
            organisationUnitCodes.includes(organisationUnit),
          );
        }
        const selectedDataElements = availableDataElements.filter(({ code }) =>
          dataElementCodes.includes(code),
        );
        const dataElementCodeToName = reduceToDictionary(selectedDataElements, 'code', 'name');

        return {
          results,
          metadata: {
            dataElementCodeToName,
          },
        };
      },
    );

  public pullEvents = jest.fn().mockImplementation((dataGroups: DataGroup[]) => {
    const { eventsByProgram } = this.mockData;
    const dataGroupCodes = dataGroups.map(({ code }) => code);

    return Object.entries(eventsByProgram)
      .filter(([program]) => dataGroupCodes.includes(program))
      .flatMap(([, events]) => events);
  });

  public pullSyncGroupResults = jest
    .fn()
    .mockImplementation((syncGroups: DataServiceSyncGroup[]) => {
      const { eventsByProgram } = this.mockData;
      const syncGroupCodes = syncGroups.map(({ code }) => code);
      return pickBy(eventsByProgram, (_, programCode) => syncGroupCodes.includes(programCode));
    });

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
    dataServiceSyncGroup: {
      records: Object.values(SYNC_GROUPS),
    },
    entity: {
      records: Object.values(ENTITIES),
    },
    dataElementDataService: {
      records: DATA_ELEMENT_DATA_SERVICES,
    },
  });
};
