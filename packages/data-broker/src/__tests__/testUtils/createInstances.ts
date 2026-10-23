/* eslint-disable @typescript-eslint/naming-convention */

import { EntityModel, EntityRecord as BaseEntityRecord, RECORDS } from '@tupaia/database';
import { DataElement, DataGroup, Entity, EntityRecord } from '../../types';

const createInstances = <K extends string, T, S>(
  fieldsByKey: Record<K, T>,
  createInstance: (fields: T) => S,
) =>
  Object.fromEntries(
    Object.entries(fieldsByKey).map(([code, fields]) => [code, createInstance(fields as T)]),
  ) as { [k in K]: S };

type DataElementFields = {
  code: string;
  service_type: DataElement['service_type'];
  config?: DataElement['config'];
  dataElementCode?: string;
  permission_groups?: string[];
};
export const dataElement = (fields: DataElementFields): DataElement => {
  const {
    code,
    service_type,
    config = {},
    dataElementCode = code,
    permission_groups = ['*'],
  } = fields;
  return { code, service_type, config, dataElementCode, permission_groups };
};
export const dataElementType = (fields: DataElementFields) =>
  ({ ...dataElement(fields), databaseRecord: RECORDS.DATA_ELEMENT } as DataElement);
export const dataElements = <K extends string>(fieldsByKey: Record<K, DataElementFields>) =>
  createInstances(fieldsByKey, dataElement);
export const dataElementTypes = <K extends string>(fieldsByKey: Record<K, DataElementFields>) =>
  createInstances(fieldsByKey, dataElementType);

type DataGroupFields = {
  code: string;
  service_type: DataGroup['service_type'];
  config?: DataGroup['config'];
};
export const dataGroup = (fields: DataGroupFields): DataGroup => {
  const { code, service_type, config = {} } = fields;
  return { code, service_type, config };
};
export const dataGroupType = (fields: DataGroupFields) =>
  ({ ...dataGroup(fields), databaseRecord: RECORDS.DATA_GROUP } as DataGroup);
export const dataGroups = <K extends string>(fieldsByKey: Record<K, DataGroupFields>) =>
  createInstances(fieldsByKey, dataGroup);
export const dataGroupTypes = <K extends string>(fieldsByKey: Record<K, DataGroupFields>) =>
  createInstances(fieldsByKey, dataGroupType);

type EntityFields = {
  code: string;
  country_code?: string | null;
  type: Entity['type'];
  name?: string;
  metadata?: Entity['metadata'];
};
export const entity = (fields: EntityFields): Entity => {
  const { code, country_code, type, name = code, metadata = {} } = fields;
  return { code, country_code, type, name, metadata };
};
export const entityType = (fields: Partial<EntityFields & BaseEntityRecord>) => {
  const entityFields: EntityFields = { ...fields, ...entity(fields as EntityFields) };
  return new BaseEntityRecord(EntityModel, entityFields) as EntityRecord;
};
export const entities = <K extends string>(fieldsByKey: Record<K, EntityFields>) =>
  createInstances(fieldsByKey, entity);
export const entityTypes = <K extends string>(
  fieldsByKey: Record<K, Partial<EntityFields & BaseEntityRecord>>,
) => createInstances(fieldsByKey, entityType);
