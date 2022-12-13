/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import {
  DataSourceConfigView,
  DATA_ELEMENT_FIELD_EDIT_CONFIG,
  SERVICE_TYPE_OPTIONS,
} from '../../common';

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

export const DataGroupsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Data Groups"
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
      title: 'New Data Group',
      actionConfig: {
        title: 'Edit Data Group',
        editEndpoint: 'dataGroups',
        fields: [...DATA_GROUP_FIELDS],
      },
    }}
    getHeaderEl={getHeaderEl}
    editorConfig={EDITOR_CONFIG}
  />
);

const IMPORT_CONFIG = {
  title: 'Import Data Elements',
  actionConfig: {
    importEndpoint: 'dataElements',
  },
};

DataGroupsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};

export const DataElementsPage = ({ getHeaderEl, ...restOfConfigs }) => (
  <ResourcePage
    title="Data Elements"
    endpoint="dataElements"
    reduxId="dataElements"
    columns={[...DATA_ELEMENT_FIELDS, ...getButtonsConfig(DATA_ELEMENT_FIELDS, 'dataElement')]}
    importConfig={IMPORT_CONFIG}
    createConfig={{
      title: 'New Data Element',
      actionConfig: {
        title: 'Edit Data Element',
        editEndpoint: 'dataElements',
        fields: [...DATA_ELEMENT_FIELDS],
      },
    }}
    getHeaderEl={getHeaderEl}
    editorConfig={EDITOR_CONFIG}
    {...restOfConfigs}
  />
);

DataElementsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
