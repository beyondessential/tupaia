/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import { LightOutlinedButton } from '@tupaia/ui-components';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledLink = styled(Link)`
  text-decoration: none;
  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
`;

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

const IMPORT_CONFIG = {
  title: 'Import Dashboard Visualisation',
  subtitle: 'Please upload a .json file with the visualisation to be imported:',
  actionConfig: {
    importEndpoint: 'dashboardVisualisations',
  },
};

const renderNewDashboardVizButton = () => (
  <StyledLink to="/viz-builder/dashboard-item/new">
    <LightOutlinedButton startIcon={<AddCircleIcon />}>New</LightOutlinedButton>
  </StyledLink>
);

export const DashboardItemsPage = ({ getHeaderEl, isBESAdmin, ...props }) => {
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
      show: isBESAdmin,
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

  return (
    <ResourcePage
      title="Dashboard Items"
      endpoint={DASHBOARD_ITEMS_ENDPOINT}
      columns={columns}
      importConfig={IMPORT_CONFIG}
      editConfig={{
        title: 'Edit Dashboard Item',
      }}
      LinksComponent={renderNewDashboardVizButton}
      getHeaderEl={getHeaderEl}
      {...props}
    />
  );
};

DashboardItemsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  isBESAdmin: PropTypes.bool,
};

DashboardItemsPage.defaultProps = {
  isBESAdmin: false,
};
