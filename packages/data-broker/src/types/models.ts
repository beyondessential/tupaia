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
  service_type: ServiceType;
  config: Record<string, DbValue>;
};

export type DataElement = DataSource & {
  permission_groups: string[];
  dataElementCode: string;
};

export type DataGroup = DataSource;

export type SyncGroup = DataSource;

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
type DataGroupModel = DatabaseModel<
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

export interface DataBrokerModelRegistry extends ModelRegistry {
  dataElement: DataElementModel;
  dataGroup: DataGroupModel;
  dataServiceEntity: DataServiceEntityModel;
  dataServiceSyncGroup: DataServiceSyncGroupModel;
  entity: EntityModel;
}
