/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ResourcePage } from './ResourcePage';

const RESOURCE_NAME = { singular: 'dashboard' };

const DASHBOARDS_ENDPOINT = 'dashboards';

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    type: 'tooltip',
  },
  {
    Header: 'Name',
    source: 'name',
  },
  {
    Header: 'Organisation Unit Code',
    source: 'root_entity_code',
    editConfig: {
      optionsEndpoint: 'entities',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      sourceKey: 'root_entity_code',
    },
  },
  {
    Header: 'Sort Order',
    source: 'sort_order',
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Dashboard',
      editEndpoint: 'dashboards',
      fields: FIELDS,
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: DASHBOARDS_ENDPOINT,
    },
  },
];

const RELATION_FIELDS = [
  {
    Header: 'Dashboard Item Code',
    source: 'dashboard_item.code',
    editable: false,
  },
  {
    Header: 'Permission Groups',
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
    Header: 'Entity Types',
    source: 'entity_types',
    editConfig: {
      type: 'autocomplete',
      allowMultipleValues: true,
      canCreateNewOptions: true,
      optionLabelKey: 'entityTypes',
      optionValueKey: 'entityTypes',
      secondaryLabel: 'Input the entity types you want. e.g: ‘country’, ‘sub_district’',
    },
  },
  {
    Header: 'Project Codes',
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
    Header: 'Sort Order',
    source: 'sort_order',
  },
];

const RELATION_COLUMNS = [
  ...RELATION_FIELDS,
  {
    Header: 'Edit',
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
    title: 'Dashboard Relations',
    columns: RELATION_COLUMNS,
    endpoint: 'dashboards/{id}/dashboardRelations',
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: DASHBOARDS_ENDPOINT,
    fields: FIELDS,
  },
};

export const DashboardsPage = props => (
  <ResourcePage
    resourceName={RESOURCE_NAME}
    endpoint={DASHBOARDS_ENDPOINT}
    columns={COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    createConfig={CREATE_CONFIG}
    {...props}
  />
);
