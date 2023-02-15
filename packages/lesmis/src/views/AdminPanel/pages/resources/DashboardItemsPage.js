/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { LightOutlinedButton } from '@tupaia/ui-components';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { DashboardItemsPage as BaseDashboardItemsPage } from '@tupaia/admin-panel';
import { getImportConfigs } from '../helpers/getImportConfigs';
import { getDeleteConfigs, getEditorConfigs } from '../helpers';
import { getColumnFilter } from '../../table/columnTypes';
import { getDeleteColumnConfigs } from '../helpers/getDeleteColumnConfigs';

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

export const DashboardItemsPage = ({ isLesmisAdmin, vizBuilderBaseUrl, translate, ...props }) => {
  const FIELDS = [
    {
      Header: translate('admin.code'),
      source: 'code',
      type: 'tooltip',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.reportCode'),
      source: 'report_code',
      type: 'tooltip',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.config'),
      source: 'config',
      type: 'jsonTooltip',
      Filter: getColumnFilter(translate),
      editConfig: { type: 'jsonEditor' },
    },
    {
      Header: translate('admin.legacy'),
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
      show: isLesmisAdmin,
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
      Header: translate('admin.export'),
      source: 'id',
      type: 'export',
      actionConfig: {
        exportEndpoint: 'dashboardVisualisation',
        fileName: '{code}',
      },
    },
    {
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
      actionConfig: {
        title: translate('admin.edit'),
        editEndpoint: DASHBOARD_ITEMS_ENDPOINT,
        fields: [...FIELDS, ...extraEditFields],
      },
    },
    getDeleteColumnConfigs(DASHBOARD_ITEMS_ENDPOINT, translate),
  ];

  const importConfig = getImportConfigs(translate, {
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
  });

  const renderNewDashboardVizButton = () => (
    <StyledLink to={`${vizBuilderBaseUrl}/viz-builder/dashboard-item/new`}>
      <LightOutlinedButton startIcon={<AddCircleIcon />}>
        {translate('admin.new')}
      </LightOutlinedButton>
    </StyledLink>
  );

  const editorConfig = getEditorConfigs(translate);
  const deleteConfig = getDeleteConfigs(translate);

  return (
    <BaseDashboardItemsPage
      title={translate('admin.dashboardItems')}
      columns={columns}
      importConfig={importConfig}
      editorConfig={editorConfig}
      deleteConfig={deleteConfig}
      LinksComponent={renderNewDashboardVizButton}
      {...props}
    />
  );
};

DashboardItemsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  isLesmisAdmin: PropTypes.bool,
  vizBuilderBaseUrl: PropTypes.string,
  translate: PropTypes.func.isRequired,
};

DashboardItemsPage.defaultProps = {
  isLesmisAdmin: false,
  vizBuilderBaseUrl: '',
};
