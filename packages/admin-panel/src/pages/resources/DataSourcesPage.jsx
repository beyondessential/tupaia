/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ResourcePage } from './ResourcePage';
import {
  DATA_ELEMENT_FIELD_EDIT_CONFIG,
  DataSourceConfigView,
  SERVICE_TYPE_OPTIONS,
} from '../../common';

const DATA_GROUP_RESOURCE_NAME = { singular: 'data group' };
const DATA_ELEMENT_RESOURCE_NAME = { singular: 'data element' };

const getButtonsConfig = (fields, recordType) => [
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: `${recordType}s`,
      fields,
      displayUsedBy: true,
      recordType,
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: `${recordType}s`,
    },
  },
];

const DATA_SOURCE_FIELDS = [
  {
    Header: 'Code',
    source: 'code',
  },
  {
    Header: 'Data Service',
    source: 'service_type',
    editConfig: { default: 'dhis', options: SERVICE_TYPE_OPTIONS },
  },
];
const DATA_ELEMENT_FIELDS = [
  ...DATA_SOURCE_FIELDS,
  {
    Header: 'Data Service Configuration',
    source: 'config',
    Cell: DataSourceConfigView,
    editConfig: DATA_ELEMENT_FIELD_EDIT_CONFIG,
  },
  {
    Header: 'Permission Groups',
    source: 'permission_groups',
    type: 'tooltip',
    editConfig: {
      type: 'jsonArray',
    },
  },
];
const DATA_GROUP_FIELDS = [
  ...DATA_SOURCE_FIELDS,
  {
    Header: 'Data Service Configuration',
    source: 'config',
    Cell: DataSourceConfigView,
    editConfig: {
      type: 'json',
      default: '{}',
      visibilityCriteria: {
        service_type: 'dhis',
      },
      getJsonFieldSchema: () => [
        {
          label: 'DHIS Server',
          fieldName: 'dhisInstanceCode',
          optionsEndpoint: 'dhisInstances',
          optionLabelKey: 'dhisInstances.code',
          optionValueKey: 'dhisInstances.code',
          visibilityCriteria: { service_type: 'dhis' },
        },
      ],
    },
  },
];

const EDITOR_CONFIG = {
  displayUsedBy: true,
};

export const DataGroupsPage = () => (
  <ResourcePage
    resourceName={DATA_GROUP_RESOURCE_NAME}
    endpoint="dataGroups"
    reduxId="dataGroups"
    columns={[...DATA_GROUP_FIELDS, ...getButtonsConfig(DATA_GROUP_FIELDS, 'dataGroup')]}
    expansionTabs={[
      {
        title: 'Data Elements',
        endpoint: 'dataGroups/{id}/dataElements',
        columns: [...DATA_ELEMENT_FIELDS, ...getButtonsConfig(DATA_ELEMENT_FIELDS, 'dataElement')],
      },
    ]}
    createConfig={{
      actionConfig: {
        editEndpoint: 'dataGroups',
        fields: DATA_GROUP_FIELDS,
      },
    }}
    editorConfig={EDITOR_CONFIG}
  />
);

const IMPORT_CONFIG = {
  actionConfig: {
    importEndpoint: 'dataElements',
  },
};

export const DataElementsPage = props => (
  <ResourcePage
    resourceName={DATA_ELEMENT_RESOURCE_NAME}
    endpoint="dataElements"
    reduxId="dataElements"
    columns={[...DATA_ELEMENT_FIELDS, ...getButtonsConfig(DATA_ELEMENT_FIELDS, 'dataElement')]}
    importConfig={IMPORT_CONFIG}
    createConfig={{
      actionConfig: {
        editEndpoint: 'dataElements',
        fields: DATA_ELEMENT_FIELDS,
      },
    }}
    editorConfig={EDITOR_CONFIG}
    {...props}
  />
);
