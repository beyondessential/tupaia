/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import { DataTableEditFields } from '../../dataTables/DataTableEditFields';
import { onProcessDataForSave } from '../../dataTables/onProcessDataForSave';
import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

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
    source: 'id',
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
    source: 'id',
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

export const DataTablesPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Data-Tables"
    endpoint={DATA_TABLES_ENDPOINT}
    columns={COLUMNS}
    importConfig={IMPORT_CONFIG}
    getHeaderEl={getHeaderEl}
    createConfig={CREATE_CONFIG}
    onProcessDataForSave={onProcessDataForSave}
    editorConfig={EDITOR_CONFIG}
  />
);

DataTablesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
