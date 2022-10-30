/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { EntityModel, EntityType as BaseEntityType, TYPES } from '@tupaia/database';
import { DataElement, DataGroup, DataServiceSyncGroup, Entity, EntityType } from '../../types';

const createInstances = <K extends string, T, S>(
  fieldsByKey: Record<K, T>,
  creator: (fields: T) => S,
) =>
  Object.fromEntries(
    Object.entries(fieldsByKey).map(([code, fields]) => [code, creator(fields as T)]),
  ) as Record<K, S>;

type DataElementFields = {
  code: string;
  service_type: DataElement['service_type'];
  config?: DataElement['config'];
  dataElementCode?: string;
};

export const dataElement = ({
  code,
  service_type,
  config = {},
  dataElementCode = code,
}: DataElementFields): DataElement => ({
  code,
  service_type,
  config,
  dataElementCode,
  permission_groups: ['*'],
});

export const dataElements = <K extends string>(fieldsByKey: Record<K, DataElementFields>) =>
  createInstances(fieldsByKey, dataElement);

export const dataElementType = (fields: DataElementFields) =>
  ({
    ...dataElement(fields),
    databaseType: TYPES.DATA_ELEMENT,
  } as DataElement);

type DataGroupFields = {
  code: string;
  service_type: DataGroup['service_type'];
  config?: DataGroup['config'];
};

export const dataElementTypes = <K extends string>(fieldsByKey: Record<K, DataElementFields>) =>
  createInstances(fieldsByKey, dataElementType);

export const dataGroup = ({ code, service_type, config = {} }: DataGroupFields): DataGroup => ({
  code,
  service_type,
  config,
});

export const dataGroups = <K extends string>(fieldsByKey: Record<K, DataGroupFields>) =>
  createInstances(fieldsByKey, dataGroup);

export const dataGroupType = ({ code, service_type, config = {} }: DataGroupFields): DataGroup =>
  ({
    code,
    service_type,
    config,
    databaseType: TYPES.DATA_GROUP,
  } as DataGroup);

export const dataGroupTypes = <K extends string>(fieldsByKey: Record<K, DataGroupFields>) =>
  createInstances(fieldsByKey, dataGroupType);

type DataServiceSyncGroupFields = {
  code: string;
  data_group_code: string;
  service_type: DataServiceSyncGroup['service_type'];
  config?: DataServiceSyncGroup['config'];
  sync_cursor?: string;
  sync_status?: DataServiceSyncGroup['sync_status'];
};

export const dataServiceSyncGroup = ({
  code,
  data_group_code,
  service_type,
  config = {},
  sync_cursor = 'sync_cursor',
  sync_status = 'IDLE',
}: DataServiceSyncGroupFields): DataServiceSyncGroup => ({
  code,
  data_group_code,
  service_type,
  config,
  sync_cursor,
  sync_status,
});

export const dataServiceSyncGroups = <K extends string>(
  fieldsByKey: Record<K, DataServiceSyncGroupFields>,
) => createInstances(fieldsByKey, dataServiceSyncGroup);

type EntityFields = {
  code: string;
  country_code?: string | null;
  type: Entity['type'];
  name?: string;
  config?: Entity['config'];
  metadata?: Entity['metadata'];
};

export const entity = ({
  code,
  country_code,
  type,
  name = code,
  config = {},
  metadata = {},
}: EntityFields): Entity => ({
  code,
  country_code,
  type,
  name,
  config,
  metadata,
});

export const entities = <K extends string>(fieldsByKey: Record<K, EntityFields>) =>
  createInstances(fieldsByKey, entity);

export const entityType = (fields: Partial<EntityFields & BaseEntityType>) => {
  const entityFields: EntityFields = { ...fields, ...entity(fields as EntityFields) };
  return new BaseEntityType(EntityModel, entityFields) as EntityType;
};

export const entityTypes = <K extends string>(
  fieldsByKey: Record<K, Partial<EntityFields & BaseEntityType>>,
) => createInstances(fieldsByKey, entityType);
