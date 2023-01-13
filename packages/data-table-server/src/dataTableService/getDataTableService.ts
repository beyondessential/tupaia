import { DataTableType } from '../models';
import * as dataTableServices from './internal';
import { DataTableServiceContext } from './types';

const typeClassMap = {
  analytics: 'AnalyticsDataTableService',
  events: 'EventsDataTableService',
  entities: 'EntitiesDataTableService',
  entity_relations: 'EntityRelationsDataTableService',
};

// https://stackoverflow.com/a/72780297
function isin<T>(key: PropertyKey, obj: T): key is keyof T {
  return key in obj;
}

export const getDataTableService = (context: DataTableServiceContext, dataTable: DataTableType) => {
  const { type, code } = dataTable;
  const serviceType = type === 'internal' ? code : type;

  if (!isin(serviceType, typeClassMap)) {
    throw new Error('Nope');
  }

  const className = typeClassMap[serviceType];

  return new (<any>dataTableServices)[className](context, dataTable.config);
};
