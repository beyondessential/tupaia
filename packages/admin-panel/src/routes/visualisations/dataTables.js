/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { DataTableEditFields } from '../../dataTables/DataTableEditFields';
import { onProcessDataForSave } from '../../dataTables/onProcessDataForSave';
import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

const RESOURCE_NAME = { singular: 'data table' };

const DATA_TABLES_ENDPOINT = 'dataTables';

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    type: 'tooltip',
  },
  {
    Header: 'Description',
    source: 'description',
  },
  {
    Header: 'Type',
    source: 'type',
  },
  {
    Header: 'Config',
    source: 'config',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Permission groups',
    source: 'permission_groups',
    type: 'tooltip',
    Filter: ArrayFilter,
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      type: 'jsonArray',
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
    title: `New ${RESOURCE_NAME.singular}`,
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
  isBESAdminOnly: true,
};
