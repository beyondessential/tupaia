/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { DataTableType } from '../models';
import { DataTableService, ClassOfDataTableService, ServiceContext } from './DataTableService';
import {
  AnalyticsDataTableService,
  EntitiesDataTableService,
  EntityRelationsDataTableService,
  EventsDataTableService,
} from './internal';
import { SqlDataTableService } from './userDefined';

/**
 * Generic builder class that allows us to configure the context for a specific DataTableService
 */
class DataTableServiceBuilderForType<Service extends DataTableService> {
  private readonly ServiceClass: ClassOfDataTableService<Service>;

  private ctx: ServiceContext<Service> | null = null;
  private config: unknown = {};

  public constructor(ServiceClass: ClassOfDataTableService<Service>) {
    this.ServiceClass = ServiceClass;
  }

  public setContext(context: ServiceContext<Service>) {
    this.ctx = context;
    return this;
  }

  public setConfig(config: unknown) {
    this.config = config;
    return this;
  }

  public build() {
    if (!this.ctx) {
      throw new Error('Must set context before building a DataTableService');
    }

    return new this.ServiceClass(this.ctx, this.config);
  }
}

const internalDataTableServiceBuilders = {
  analytics: () => new DataTableServiceBuilderForType(AnalyticsDataTableService),
  events: () => new DataTableServiceBuilderForType(EventsDataTableService),
  entities: () => new DataTableServiceBuilderForType(EntitiesDataTableService),
  entity_relations: () => new DataTableServiceBuilderForType(EntityRelationsDataTableService),
};

const userDefinedDataTableServiceBuilders = {
  sql: () => new DataTableServiceBuilderForType(SqlDataTableService),
};

const dataTablesServiceBuilders = {
  ...internalDataTableServiceBuilders,
  ...userDefinedDataTableServiceBuilders,
};

const isValidServiceType = (
  serviceType: string,
): serviceType is keyof typeof dataTablesServiceBuilders =>
  serviceType in dataTablesServiceBuilders;

export const getDataTableServiceType = (dataTable: DataTableType) => {
  const { type, code } = dataTable;
  const serviceType = type === 'internal' ? code : type;

  if (type === 'internal' && !(serviceType in internalDataTableServiceBuilders)) {
    throw new Error(
      `No internal data-table defined for: ${serviceType}, must be one of: ${Object.keys(
        internalDataTableServiceBuilders,
      )}`,
    );
  }

  if (!isValidServiceType(serviceType)) {
    throw new Error(
      `No data table service defined for: ${serviceType}, must be one of: ${Object.keys(
        userDefinedDataTableServiceBuilders,
      )}`,
    );
  }

  return serviceType;
};

export class DataTableServiceBuilder {
  public setServiceType<T extends keyof typeof dataTablesServiceBuilders>(serviceType: T) {
    return dataTablesServiceBuilders[serviceType]() as ReturnType<
      typeof dataTablesServiceBuilders[T]
    >;
  }
}
