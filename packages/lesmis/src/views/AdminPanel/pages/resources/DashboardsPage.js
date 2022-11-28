/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { DashboardsPage as BaseDashboardsPage } from '@tupaia/admin-panel';
import { getCreateConfigs, getDeleteConfigs, getEditorConfigs } from '../helpers';
import { getColumnFilter } from '../../table/columnTypes';

const DASHBOARDS_ENDPOINT = 'dashboards';

export const DashboardsPage = ({ getHeaderEl, translate }) => {
  const ColumnFilter = getColumnFilter(translate);

  const FIELDS = [
    {
      Header: translate('admin.code'),
      source: 'code',
      type: 'tooltip',
      Fitler: ColumnFilter,
    },
    {
      Header: translate('admin.name'),
      source: 'name',
      Fitler: ColumnFilter,
    },
    {
      Header: translate('admin.organisationUnitCode'),
      source: 'root_entity_code',
      Fitler: ColumnFilter,

      editConfig: {
        optionsEndpoint: 'entities',
        optionLabelKey: 'code',
        optionValueKey: 'code',
        sourceKey: 'root_entity_code',
      },
    },
    {
      Header: translate('admin.sortOrder'),
      Fitler: ColumnFilter,
      source: 'sort_order',
    },
  ];

  const COLUMNS = [
    ...FIELDS,
    {
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
      actionConfig: {
        title: translate('admin.edit'),
        editEndpoint: 'dashboards',
        fields: [...FIELDS],
      },
    },
    {
      Header: translate('admin.delete'),
      source: 'id',
      type: 'delete',
      actionConfig: {
        endpoint: DASHBOARDS_ENDPOINT,
      },
    },
  ];

  const RELATION_FIELDS = [
    {
      Header: translate('admin.dashboardItemCode'),
      source: 'dashboard_item.code',
      editable: false,
    },
    {
      Header: translate('admin.permissionGroups'),
      source: 'permission_groups',
      editConfig: {
        optionsEndpoint: 'permissionGroups',
        optionLabelKey: 'name',
        optionValueKey: 'name',
        sourceKey: 'permission_groups',
        allowMultipleValues: true,
      },
    },
    {
      Header: translate('admin.entityTypes'),
      source: 'entity_types',
      editConfig: {
        type: 'autocomplete',
        allowMultipleValues: true,
        canCreateNewOptions: true,
        optionLabelKey: 'entityTypes',
        optionValueKey: 'entityTypes',
        secondaryLabel: "Input the entity types you want. Eg: 'country', 'sub_district'",
      },
    },
    {
      Header: translate('admin.projectCodes'),
      source: 'project_codes',
      editConfig: {
        optionsEndpoint: 'projects',
        optionLabelKey: 'code',
        optionValueKey: 'code',
        sourceKey: 'project_codes',
        allowMultipleValues: true,
      },
    },
    {
      Header: translate('admin.sortOrder'),
      source: 'sort_order',
    },
  ];

  const RELATION_COLUMNS = [
    ...RELATION_FIELDS,
    {
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
      actionConfig: {
        editEndpoint: 'dashboardRelations',
        fields: RELATION_FIELDS,
      },
    },
  ];

  const EXPANSION_CONFIG = [
    {
      title: translate('admin.dashboardRelations'),
      columns: RELATION_COLUMNS,
      endpoint: 'dashboards/{id}/dashboardRelations',
    },
  ];

  const CREATE_CONFIG = getCreateConfigs(translate, {
    editEndpoint: DASHBOARDS_ENDPOINT,
    fields: FIELDS,
  });
  const EDITOR_CONFIG = getEditorConfigs(translate);
  const DELETE_CONFIG = getDeleteConfigs(translate);

  return (
    <BaseDashboardsPage
      title={translate('admin.dashboards')}
      columns={COLUMNS}
      expansionTabs={EXPANSION_CONFIG}
      createConfig={CREATE_CONFIG}
      editorConfig={EDITOR_CONFIG}
      deleteConfig={DELETE_CONFIG}
      getHeaderEl={getHeaderEl}
    />
  );
};

DashboardsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};
