import type {
  DatabaseModel as BaseDatabaseModel,
  DatabaseRecord as BaseDatabaseRecord,
  DataElementModel as BaseDataElementModel,
  DataElementRecord as BaseDataElementRecord,
  DataGroupModel as BaseDataGroupModel,
  DataGroupRecord as BaseDataGroupRecord,
  DataServiceSyncGroupModel as BaseDataServiceSyncGroupModel,
  DataServiceSyncGroupRecord as BaseDataServiceSyncGroupRecord,
  EntityModel as BaseEntityModel,
  EntityRecord as BaseEntityRecord,
  ModelRegistry,
  RECORDS,
  TupaiaDatabase,
} from '@tupaia/database';
import { Join, Override, Values } from './utils';

type DbValue = string | number | boolean | null | DbValue[] | { [key: string]: DbValue };

type DbRecord = Record<string, DbValue>;

// Conditions for flat i.e. non array/json fields
type FlatFieldConditions<T> = {
  [K in keyof T as T[K] extends Record<string, unknown>
    ? never
    : T[K] extends unknown[]
      ? never
      : K]: T[K] | T[K][];
};

type JsonFieldConditions<T> = Values<{
  [K in keyof T as T[K] extends Record<string, string | number | boolean> ? K : never]: {
    [K1 in keyof T[K] as Join<K, K1, '->>'>]: T[K][K1] | T[K][K1][];
  };
}>;

export type DbConditions<R> = Partial<FlatFieldConditions<R> & JsonFieldConditions<R>>;

export type DatabaseRecord<
  R extends DbRecord,
  T extends BaseDatabaseRecord = BaseDatabaseRecord,
> = T & R;

type DatabaseModel<
  R extends DbRecord,
  T extends BaseDatabaseRecord = BaseDatabaseRecord,
  M extends BaseDatabaseModel = BaseDatabaseModel,
> = Omit<M, 'find' | 'findOne'> & {
  find: (dbConditions: DbConditions<R>) => Promise<DatabaseRecord<R, T>[]>;
  findOne: (dbConditions: DbConditions<R>) => Promise<DatabaseRecord<R, T>>;
};

export type DataSourceType = 'dataElement' | 'dataGroup' | 'syncGroup';

export type ServiceType =
  | 'data-lake'
  | 'dhis'
  | 'indicator'
  | 'kobo'
  | 'tupaia'
  | 'weather'
  | 'superset';

export type DataSource = {
  code: string;
  service_type: ServiceType;
  config: Record<string, DbValue>;
};

export type DataElement = DataSource & {
  permission_groups: string[];
  dataElementCode: string;
};

export type DataGroup = DataSource;

export type DataServiceSyncGroup = DataSource & {
  data_group_code: string;
  sync_cursor: string;
  sync_status: SyncStatus;
};

type SyncStatus = 'IDLE' | 'SYNCING' | 'ERROR';

export type DataServiceEntity = {
  config: {
    dhis_id: string;
    kobo_id: string;
  };
  entity_code: string;
};

export type Entity = {
  code: string;
  name: string;
  type: string;
  point?: string;
  config: {
    kobo_id?: string;
  };
  metadata: {
    dhis?: {
      trackedEntityId: string;
    };
  };
  country_code?: string | null;
};

export type DataElementDataService = {
  data_element_code: string;
  country_code: string;
  service_type: ServiceType;
  service_config: {
    dhisInstanceCode: string;
  };
};

export type SupersetInstance = {
  code: string;
  config: {
    serverName: string;
    baseUrl: string;
    insecure?: boolean;
  };
};

export type DhisInstance = {
  code: string;
  readonly: boolean;
  config: {
    productionUrl: string;
    devUrl: string;
  };
};

export type EntityHierarchy = {
  name: string;
  canonical_types: string[];
};

export type DataSourceTypeInstance = DataSource & {
  databaseRecord:
    | typeof RECORDS.DATA_ELEMENT
    | typeof RECORDS.DATA_GROUP
    | typeof RECORDS.DATA_SERVICE_SYNC_GROUP;
};
type DataElementRecord = DatabaseRecord<DataElement, BaseDataElementRecord>;
export interface EntityRecord extends DatabaseRecord<Entity, BaseEntityRecord> {}

export type DataElementModel = DatabaseModel<
  DataElement,
  BaseDataElementRecord,
  Override<
    BaseDataElementModel,
    {
      getDhisDataTypes: () => Record<string, 'DataElement' | 'Indicator'>;
    }
  >
>;
export type DataGroupModel = DatabaseModel<
  DataGroup,
  BaseDataGroupRecord,
  Override<
    BaseDataGroupModel,
    {
      getDataElementsInDataGroup: (dataGroupCode: string) => Promise<DataElementRecord[]>;
    }
  >
>;
export type DataServiceSyncGroupModel = DatabaseModel<
  DataServiceSyncGroup,
  BaseDataServiceSyncGroupRecord,
  BaseDataServiceSyncGroupModel
>;
type DataServiceEntityModel = DatabaseModel<DataServiceEntity>;
type EntityModel = DatabaseModel<Entity, EntityRecord, BaseEntityModel>;
type SupersetInstanceModel = DatabaseModel<SupersetInstance>;
type DataElementDataServiceModel = DatabaseModel<DataElementDataService>;
type DhisInstanceModel = DatabaseModel<DhisInstance>;
type EntityHierarchyModel = DatabaseModel<EntityHierarchy>;

export interface DataBrokerModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly dataElementDataService: DataElementDataServiceModel;
  readonly supersetInstance: SupersetInstanceModel;
  readonly dataElement: DataElementModel;
  readonly dataGroup: DataGroupModel;
  readonly dataServiceEntity: DataServiceEntityModel;
  readonly dataServiceSyncGroup: DataServiceSyncGroupModel;
  readonly entity: EntityModel;
  readonly dhisInstance: DhisInstanceModel;
  readonly entityHierarchy: EntityHierarchyModel;
}
