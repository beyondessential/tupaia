import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

const RESOURCE_NAME = { singular: 'external database connection' };

const EXTERNAL_DATABASE_CONNECTIONS_ENDPOINT = 'externalDatabaseConnections';

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    required: true,
  },
  {
    Header: 'Name',
    source: 'name',
    required: true,
  },
  {
    Header: 'Description',
    source: 'description',
  },
  {
    Header: 'Permission groups',
    source: 'permission_groups',
    Filter: ArrayFilter,
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      optionsEndpoint: 'permissionGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      sourceKey: 'permission_groups',
      allowMultipleValues: true,
    },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: EXTERNAL_DATABASE_CONNECTIONS_ENDPOINT,
      title: `Edit ${RESOURCE_NAME.singular}`,
      fields: FIELDS,
    },
  },
  {
    Header: 'Test',
    type: 'testDatabaseConnection',
    width: 90,
    disableResizing: true,
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: EXTERNAL_DATABASE_CONNECTIONS_ENDPOINT,
    },
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: EXTERNAL_DATABASE_CONNECTIONS_ENDPOINT,
    fields: FIELDS,
  },
};

export const externalDatabaseConnections = {
  resourceName: RESOURCE_NAME,
  path: '',
  endpoint: EXTERNAL_DATABASE_CONNECTIONS_ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
};
