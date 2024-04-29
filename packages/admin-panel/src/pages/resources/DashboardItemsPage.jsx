/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ResourcePage } from './ResourcePage';
import { CreateActionButton } from '../../editor';

const RESOURCE_NAME = { singular: 'dashboard item' };

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

export const DashboardItemsPage = ({ vizBuilderBaseUrl, ...props }) => {
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
          path: `${vizBuilderBaseUrl}/viz-builder/dashboard-item/:id`,
          parameters: { id: 'id' },
        },
        visibilityCriteria: {
          legacy: false,
        },
      },
    },
  ];

  const columns = [
    ...FIELDS,
    {
      Header: 'Export',
      source: 'id',
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
      source: 'id',
      type: 'delete',
      actionConfig: {
        endpoint: DASHBOARD_ITEMS_ENDPOINT,
      },
    },
  ];

  const renderNewDashboardVizButton = () => (
    <CreateActionButton to={`${vizBuilderBaseUrl}/viz-builder/dashboard-item/new`} component={Link}>
      New
    </CreateActionButton>
  );
  const importConfig = {
    subtitle: 'Please upload one or more JSON files with visualisations to be imported',
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
            <Link to={`${vizBuilderBaseUrl}/viz-builder/dashboard-item/${id}`}>
              View in Visualisation Builder
            </Link>
          </p>
        ))}
      </>
    ),
  };

  return (
    <ResourcePage
      resourceName={RESOURCE_NAME}
      endpoint={DASHBOARD_ITEMS_ENDPOINT}
      columns={columns}
      importConfig={importConfig}
      LinksComponent={renderNewDashboardVizButton}
      {...props}
    />
  );
};

DashboardItemsPage.propTypes = {
  vizBuilderBaseUrl: PropTypes.string,
};

DashboardItemsPage.defaultProps = {
  vizBuilderBaseUrl: '',
};
