/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import type {
  DatabaseModel as BaseDatabaseModel,
  DatabaseType as BaseDatabaseType,
  DataSourceModel as BaseDataSourceModel,
  DataSourceType as BaseDataSourceType,
  EntityModel as BaseEntityModel,
  EntityType as BaseEntityType,
  ModelRegistry,
} from '@tupaia/database';
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

export type ServiceType = 'data-lake' | 'dhis' | 'indicator' | 'kobo' | 'tupaia' | 'weather';

export type DataSource = {
  code: string;
  type: DataSourceType;
  service_type: ServiceType;
  config: Record<string, DbValue>;
};

export type DataElement = DataSource & { type: 'dataElement'; dataElementCode: string };
export type DataGroup = DataSource & { type: 'dataGroup' };
export type SyncGroup = DataSource & { type: 'syncGroup' };

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
  config: Record<string, DbValue>;
};

export type Entity = {
  code: string;
  name: string;
  point: string;
  config: {
    kobo_id?: string;
  };
};

export type EntityInstance = DatabaseType<Entity, BaseEntityType>;

export type DataSourceModel = DatabaseModel<
  DataSource,
  BaseDataSourceType,
  Override<
    BaseDataSourceModel,
    {
      getDataElementsInGroup: (
        dataGroupCode: string,
      ) => Promise<DatabaseType<DataSource, BaseDataSourceType>[]>;
      getDhisDataTypes: () => Record<string, 'DataElement' | 'Indicator'>;
      getTypes: () => {
        DATA_ELEMENT: 'dataElement';
        DATA_GROUP: 'dataGroup';
        SYNC_GROUP: 'syncGroup';
      };
    }
  >
>;
type DataServiceEntityModel = DatabaseModel<DataServiceEntity>;
type DataServiceSyncGroupModel = DatabaseModel<DataServiceSyncGroup>;
type EntityModel = DatabaseModel<Entity, EntityInstance, BaseEntityModel>;

export interface DataBrokerModelRegistry extends ModelRegistry {
  dataSource: DataSourceModel;
  dataServiceEntity: DataServiceEntityModel;
  dataServiceSyncGroup: DataServiceSyncGroupModel;
  entity: EntityModel;
}
