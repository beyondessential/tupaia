/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { CreateActionButton } from '../../editor';

export const DASHBOARD_ITEMS_ENDPOINT = 'dashboardItems';

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    type: 'tooltip',
  },
  {
    Header: 'Report Code',
    source: 'report_code',
    type: 'tooltip',
  },
  {
    Header: 'Config',
    source: 'config',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Legacy',
    source: 'legacy',
    type: 'boolean',
    editConfig: { type: 'boolean' },
  },
];

const extraEditFields = [
  // ID field for constructing viz-builder path only, not for showing or editing
  {
    Header: 'ID',
    source: 'id',
    show: false,
  },
  {
    Header: 'Edit using Visualisation Builder',
    type: 'link',
    editConfig: {
      type: 'link',
      linkOptions: {
        path: '/viz-builder/dashboard-item/:id',
        parameters: { id: 'id' },
      },
      visibilityCriteria: {
        legacy: false,
      },
    },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Export',
    type: 'export',
    actionConfig: {
      exportEndpoint: 'dashboardVisualisation',
      fileName: '{code}',
    },
  },
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Dashboard Item',
      editEndpoint: DASHBOARD_ITEMS_ENDPOINT,
      fields: [...FIELDS, ...extraEditFields],
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: DASHBOARD_ITEMS_ENDPOINT,
    },
  },
];

const IMPORT_CONFIG = {
  title: 'Import Dashboard Visualisation',
  subtitle: 'Please upload one or more .json files with visualisations to be imported:',
  actionConfig: {
    importEndpoint: 'dashboardVisualisations',
    multiple: true,
  },
  getFinishedMessage: response => (
    <>
      <span>{response.message}</span>
      {response.importedVizes.map(({ code, id }) => (
        <p>
          <span>{`${code}: `}</span>
          <Link to={`/viz-builder/dashboard-item/${id}`}>View in Visualisation Builder</Link>
        </p>
      ))}
    </>
  ),
};

const LinksComponent = () => (
  <CreateActionButton to="/viz-builder/dashboard-item/new" component={Link}>
    New
  </CreateActionButton>
);

export const dashboardItems = {
  title: 'Dashboard items',
  path: '',
  default: true,
  endpoint: DASHBOARD_ITEMS_ENDPOINT,
  importConfig: IMPORT_CONFIG,
  columns: COLUMNS,
  LinksComponent,
};
