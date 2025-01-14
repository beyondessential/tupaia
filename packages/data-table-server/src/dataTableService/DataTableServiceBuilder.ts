import { DataTable } from '@tupaia/types';
import { DataTableService, ClassOfDataTableService, ServiceContext } from './DataTableService';
import {
  AnalyticsDataTableService,
  DataElementMetadataDataTableService,
  DataGroupMetaDataDataTableService,
  EntitiesDataTableService,
  EntityAttributesDataTableService,
  EntityRelationsDataTableService,
  EventsDataTableService,
  SqlDataTableService,
  SurveyResponseDataTableService,
} from './services';

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

const dataTablesServiceBuilders = {
  analytics: () => new DataTableServiceBuilderForType(AnalyticsDataTableService),
  data_element_metadata: () =>
    new DataTableServiceBuilderForType(DataElementMetadataDataTableService),
  data_group_metadata: () => new DataTableServiceBuilderForType(DataGroupMetaDataDataTableService),
  events: () => new DataTableServiceBuilderForType(EventsDataTableService),
  entities: () => new DataTableServiceBuilderForType(EntitiesDataTableService),
  entity_relations: () => new DataTableServiceBuilderForType(EntityRelationsDataTableService),
  sql: () => new DataTableServiceBuilderForType(SqlDataTableService),
  entity_attributes: () => new DataTableServiceBuilderForType(EntityAttributesDataTableService),
  survey_responses: () => new DataTableServiceBuilderForType(SurveyResponseDataTableService),
};

const isValidServiceType = (
  serviceType: string,
): serviceType is keyof typeof dataTablesServiceBuilders =>
  serviceType in dataTablesServiceBuilders;

export const getDataTableServiceType = (dataTable: DataTable) => {
  const { type } = dataTable;

  if (!isValidServiceType(type)) {
    throw new Error(
      `No data table service defined for: ${type}, must be one of: ${Object.keys(
        dataTablesServiceBuilders,
      )}`,
    );
  }

  return type;
};

export class DataTableServiceBuilder {
  public setServiceType<T extends keyof typeof dataTablesServiceBuilders>(serviceType: T) {
    return dataTablesServiceBuilders[serviceType]() as ReturnType<
      (typeof dataTablesServiceBuilders)[T]
    >;
  }
}
