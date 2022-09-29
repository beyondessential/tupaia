/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import type {
  DatabaseModel as BaseDatabaseModel,
  DatabaseType as BaseDatabaseType,
  DataElementModel as BaseDataElementModel,
  DataElementType as BaseDataElementType,
  DataGroupModel as BaseDataGroupModel,
  DataGroupType as BaseDataGroupType,
  EntityModel as BaseEntityModel,
  EntityType as BaseEntityType,
  ModelRegistry,
} from '@tupaia/database';
import { TYPES } from '@tupaia/database';
import { Join, Override, Values } from './utils';

type DbValue = string | number | boolean | null | DbValue[] | { [key: string]: DbValue };

export type DbRecord = Record<string, DbValue>;

// Conditions for flat i.e. non array/json fields
type FlatFieldConditions<T> = {
  [K in keyof T as T[K] extends Record<string, unknown>
    ? never
    : T[K] extends unknown[]
    ? never
    : K]: T[K] | T[K][];
};

type JsonFieldConditions<T> = Values<
  {
    [K in keyof T as T[K] extends Record<string, string | number | boolean> ? K : never]: {
      [K1 in keyof T[K] as Join<K, K1, '->>'>]: T[K][K1] | T[K][K1][];
    };
  }
>;

export type DbConditions<R> = Partial<FlatFieldConditions<R> & JsonFieldConditions<R>>;

export type DatabaseType<R extends DbRecord, T extends BaseDatabaseType = BaseDatabaseType> = T &
  T &
  R;

type DatabaseModel<
  R extends DbRecord,
  T extends BaseDatabaseType = BaseDatabaseType,
  M extends BaseDatabaseModel = BaseDatabaseModel
> = M & {
  find: (dbConditions: DbConditions<R>) => Promise<DatabaseType<R, T>[]>;
  findOne: (dbConditions: DbConditions<R>) => Promise<DatabaseType<R, T>>;
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
  databaseType:
    | typeof TYPES.DATA_ELEMENT
    | typeof TYPES.DATA_GROUP
    | typeof TYPES.DATA_SERVICE_SYNC_GROUP;
};

export type DataElement = DataSource & {
  permission_groups: string[];
  dataElementCode: string;
  databaseType: typeof TYPES.DATA_ELEMENT;
};

export type DataGroup = DataSource & {
  databaseType: typeof TYPES.DATA_GROUP;
};

export type SYNC_STATUS = 'IDLE' | 'SYNCING' | 'ERROR';

export type DataServiceEntity = {
  config: {
    dhis_id: string;
    kobo_id: string;
  };
  entity_code: string;
};

export type DataServiceSyncGroup = {
  code: string;
  service_type: ServiceType;
  config: Record<string, any>;
  data_group_code: string;
  sync_cursor: string;
  sync_status: SYNC_STATUS;
  databaseType: typeof TYPES.DATA_SERVICE_SYNC_GROUP;
};

export type Entity = {
  code: string;
  name: string;
  point?: string;
  config: {
    kobo_id?: string;
  };
  country_code?: string;
  type: string;
};

export type DataElementDataService = {
  data_element_code: string;
  country_code: string;
  service_type: ServiceType;
  service_config: Record<string, any>;
};

export type SupersetInstance = {
  code: string;
  config: Record<string, any>;
};

export type DhisInstance = {
  code: string;
  readonly: boolean;
  config: Record<string, any>;
};

export type EntityHierarchy = {
  name: string;
  canonical_types: string[];
};

type DataElementInstance = DatabaseType<DataElement, BaseDataElementType>;
export type EntityInstance = DatabaseType<Entity, BaseEntityType>;

export type DataElementModel = DatabaseModel<
  DataElement,
  BaseDataElementType,
  Override<
    BaseDataElementModel,
    {
      getDhisDataTypes: () => Record<string, 'DataElement' | 'Indicator'>;
    }
  >
>;
export type DataGroupModel = DatabaseModel<
  DataGroup,
  BaseDataGroupType,
  Override<
    BaseDataGroupModel,
    {
      getDataElementsInDataGroup: (dataGroupCode: string) => Promise<DataElementInstance[]>;
    }
  >
>;
type DataServiceEntityModel = DatabaseModel<DataServiceEntity>;
type DataServiceSyncGroupModel = DatabaseModel<DataServiceSyncGroup>;
type EntityModel = DatabaseModel<Entity, EntityInstance, BaseEntityModel>;
type SupersetInstanceModel = DatabaseModel<SupersetInstance>;
type DataElementDataServiceModel = DatabaseModel<DataElementDataService>;
type DhisInstanceModel = DatabaseModel<DhisInstance>;
type EntityHierarchyModel = DatabaseModel<EntityHierarchy>;

export interface DataBrokerModelRegistry extends ModelRegistry {
  dataElementDataService: DataElementDataServiceModel;
  supersetInstance: SupersetInstanceModel;
  dataElement: DataElementModel;
  dataGroup: DataGroupModel;
  dataServiceEntity: DataServiceEntityModel;
  dataServiceSyncGroup: DataServiceSyncGroupModel;
  entity: EntityModel;
  dhisInstance: DhisInstanceModel;
  entityHierarchy: EntityHierarchyModel;
}
