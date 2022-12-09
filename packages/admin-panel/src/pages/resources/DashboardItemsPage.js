/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  LightOutlinedButton,
  SmallAlert,
  Button,
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogContent,
} from '@tupaia/ui-components';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ResourcePage } from './ResourcePage';
import { useUser } from '../../VizBuilderApp/api';
import { FEATURE_PERMISSION_MESSAGE } from './constants';

const Content = styled(DialogContent)`
  text-align: left;
  min-height: 220px;
`;

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

export const DashboardItemsPage = ({ getHeaderEl, vizBuilderBaseUrl, ...props }) => {
  const { isVizBuilderUser } = useUser();

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
      show: isVizBuilderUser,
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
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const handleClose = () => {
    setIsPermissionDialogOpen(false);
  };

  const handleClick = () => {
    console.log('Im handling the click');
    setIsPermissionDialogOpen(true);
    console.log('isPermissionDialogOpen', isPermissionDialogOpen);
  };

  const renderNewDashboardVizButton = () => {
    if (isVizBuilderUser) {
      return (
        <StyledLink to={`${vizBuilderBaseUrl}/viz-builder/dashboard-item/new`}>
          <LightOutlinedButton startIcon={<AddCircleIcon />}>New</LightOutlinedButton>
        </StyledLink>
      );
    }
    return (
      <LightOutlinedButton onClick={handleClick} startIcon={<AddCircleIcon />}>
        New
      </LightOutlinedButton>
    );
  };

  const importConfig = {
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
            <Link to={`${vizBuilderBaseUrl}/viz-builder/dashboard-item/${id}`}>
              View in Visualisation Builder
            </Link>
          </p>
        ))}
      </>
    ),
  };

  const PermissionDialogComponent = () => (
    <Dialog onClose={handleClose} open={isPermissionDialogOpen} disableBackdropClick>
      <DialogHeader title="Permissions Required" onClose={handleClose} />
      <Content>
        <SmallAlert severity="error" variant="standard">
          {FEATURE_PERMISSION_MESSAGE}
        </SmallAlert>
      </Content>
      <DialogFooter>
        <Button onClick={handleClose}>Close</Button>
      </DialogFooter>
    </Dialog>
  );

  return (
    <ResourcePage
      title="Dashboard Items"
      endpoint={DASHBOARD_ITEMS_ENDPOINT}
      columns={columns}
      importConfig={importConfig}
      LinksComponent={renderNewDashboardVizButton}
      getHeaderEl={getHeaderEl}
      PermissionDialogComponent={PermissionDialogComponent}
      {...props}
    />
  );
};

DashboardItemsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  vizBuilderBaseUrl: PropTypes.string,
};

DashboardItemsPage.defaultProps = {
  vizBuilderBaseUrl: '',
};
