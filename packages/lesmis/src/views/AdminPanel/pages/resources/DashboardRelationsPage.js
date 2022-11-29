/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { DashboardRelationsPage as BaseDashboardRelationsPage } from '@tupaia/admin-panel';
import { prettyArray } from '../../utilities';
import { getArrayFilter, getColumnFilter } from '../../table/columnTypes';
import { getBaseEditorConfigs, getCreateConfigs, getDeleteConfigs } from '../helpers';

// export for use on users page
export const DASHBOARD_RELATION_ENDPOINT = 'dashboardRelations';

export const DashboardRelationsPage = ({ getHeaderEl, translate }) => {
  const ArrayFilter = getArrayFilter(translate);
  const ColumnFilter = getColumnFilter(translate);

  const DASHBOARD_RELATION_COLUMNS = [
    {
      Header: translate('admin.code'),
      source: 'dashboard.code',
      Filter: ColumnFilter,
      editConfig: {
        optionsEndpoint: 'dashboards',
        optionLabelKey: 'dashboard.code',
        optionValueKey: 'dashboard.id',
        sourceKey: 'dashboard_id',
      },
    },
    {
      Header: translate('admin.dashboardItemCode'),
      source: 'dashboard_item.code',
      Filter: ColumnFilter,
      editConfig: {
        optionsEndpoint: 'dashboardItems',
        optionLabelKey: 'dashboard_item.code',
        optionValueKey: 'dashboard_item.id',
        sourceKey: 'child_id',
      },
    },
    {
      Header: translate('admin.permissionGroups'),
      source: 'permission_groups',
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
    {
      Header: translate('admin.entityTypes'),
      source: 'entity_types',
      Filter: ArrayFilter,
      Cell: ({ value }) => prettyArray(value),
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
      Filter: ArrayFilter,
      Cell: ({ value }) => prettyArray(value),
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
      Filter: ColumnFilter,
    },
  ];

  const FIELDS = [
    ...DASHBOARD_RELATION_COLUMNS,
    {
      Header: translate('admin.edit'),
      source: 'id',
      type: 'edit',
      actionConfig: {
        title: translate('admin.edit'),
        editEndpoint: DASHBOARD_RELATION_ENDPOINT,
        fields: DASHBOARD_RELATION_COLUMNS,
      },
    },
    {
      Header: translate('admin.delete'),
      source: 'id',
      type: 'delete',
      actionConfig: {
        endpoint: DASHBOARD_RELATION_ENDPOINT,
      },
    },
  ];

  const createConfig = getCreateConfigs(translate, {
    actionConfig: {
      editEndpoint: DASHBOARD_RELATION_ENDPOINT,
      fields: DASHBOARD_RELATION_COLUMNS,
    },
  });
  const editorConfig = getBaseEditorConfigs(translate);
  const deleteConfig = getDeleteConfigs(translate);

  return (
    <BaseDashboardRelationsPage
      title={translate('admin.dashboardRelations')}
      columns={FIELDS}
      createConfig={createConfig}
      editorConfig={editorConfig}
      deleteConfig={deleteConfig}
      getHeaderEl={getHeaderEl}
    />
  );
};

DashboardRelationsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};
