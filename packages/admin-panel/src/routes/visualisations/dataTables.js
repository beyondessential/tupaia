import { DataTableType } from '@tupaia/types';
import { DataTableEditFields } from '../../dataTables/DataTableEditFields';
import { onProcessDataForSave } from '../../dataTables/onProcessDataForSave';
import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';
import { VIZ_BUILDER_PERMISSION_GROUP } from '../../utilities/userAccess';

const RESOURCE_NAME = { singular: 'data table' };

const DATA_TABLES_ENDPOINT = 'dataTables';

/**
 * @param {boolean} hasBesAdminAccess
 * @returns {Array<{label: string, value: string}>}
 */
const getDataTableTypeOptions = hasBesAdminAccess =>
  Object.values(DataTableType)
    // Only SQL tables are relevant to non-BES-Admin Viz Builder Users
    .filter(hasBesAdminAccess ? () => true : type => type === DataTableType.sql)
    .map(type => ({ label: type, value: type }));

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    required: true,
  },
  {
    Header: 'Description',
    source: 'description',
    required: true,
  },
  {
    Header: 'Type',
    source: 'type',
    required: true,
    editConfig: {
      options: getDataTableTypeOptions,
    },
  },
  {
    Header: 'Config',
    source: 'config',
    type: 'jsonTooltip',
    required: true,
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Permission groups',
    source: 'permission_groups',
    required: true,
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
    Header: 'Export',
    type: 'export',
    actionConfig: {
      exportEndpoint: 'dataTable',
      fileName: '{code}.json',
    },
  },
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: `Edit ${RESOURCE_NAME.singular}`,
      editEndpoint: DATA_TABLES_ENDPOINT,
      fields: FIELDS,
      FieldsComponent: DataTableEditFields,
      displayUsedBy: true,
      recordType: 'dataTable',
      extraDialogProps: {
        fullWidth: true,
        maxWidth: 'xl',
      },
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: DATA_TABLES_ENDPOINT,
    },
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: DATA_TABLES_ENDPOINT,
    fields: FIELDS,
    FieldsComponent: DataTableEditFields,
    extraDialogProps: {
      fullWidth: true,
      maxWidth: 'xl',
    },
  },
};

const IMPORT_CONFIG = {
  title: `Import ${RESOURCE_NAME.singular}`,
  actionConfig: {
    importEndpoint: 'dataTables',
    multiple: true,
    accept: {
      'application/json': ['.json'],
    },
  },
};
const EDITOR_CONFIG = { displayUsedBy: true };

export const dataTables = {
  resourceName: RESOURCE_NAME,
  path: '/data-tables',
  endpoint: DATA_TABLES_ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  importConfig: IMPORT_CONFIG,
  editorConfig: EDITOR_CONFIG,
  onProcessDataForSave,
  needsVizBuilderAccess: ['create', 'edit'],
  needsBESAdminAccess: ['delete', 'import'],
  requiresSomePermissionGroup: [VIZ_BUILDER_PERMISSION_GROUP],
};
