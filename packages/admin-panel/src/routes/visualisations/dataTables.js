/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { DataTableType } from '@tupaia/types';
import { DataTableEditFields } from '../../dataTables/DataTableEditFields';
import { onProcessDataForSave } from '../../dataTables/onProcessDataForSave';
import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

const DATA_TABLES_ENDPOINT = 'dataTables';

const dataTableTypeOptions = Object.values(DataTableType).map(type => ({
  label: type,
  value: type,
}));

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    required: true,
    type: 'tooltip',
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
      options: dataTableTypeOptions,
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
    type: 'tooltip',
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
      fileName: '{code}',
    },
  },
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Data Table',
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
  title: 'New Data Table',
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
  title: 'Import Data Table',
  actionConfig: {
    importEndpoint: 'dataTables',
  },
};
const EDITOR_CONFIG = { displayUsedBy: true };

export const dataTables = {
  title: 'Data tables',
  path: '/data-tables',
  endpoint: DATA_TABLES_ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  importConfig: IMPORT_CONFIG,
  editorConfig: EDITOR_CONFIG,
  onProcessDataForSave,
  isBESAdminOnly: true,
};
