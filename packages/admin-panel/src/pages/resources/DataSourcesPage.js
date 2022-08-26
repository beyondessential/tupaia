/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

const SERVICE_TYPE_OPTIONS = [
  {
    label: 'Data Lake',
    value: 'data-lake',
  },
  {
    label: 'DHIS',
    value: 'dhis',
  },
  {
    label: 'Indicator',
    value: 'indicator',
  },
  {
    label: 'Kobo',
    value: 'kobo',
  },
  {
    label: 'Superset',
    value: 'superset',
  },
  {
    label: 'Tupaia',
    value: 'tupaia',
  },
  {
    label: 'Weather',
    value: 'weather',
  },
];

const localStyles = {
  config: {
    dt: {
      float: 'left',
      clear: 'left',
      width: '175px',
      textAlign: 'right',
      marginRight: '5px',
    },
  },
};

const DataSourceConfigView = row => {
  const blankString = '';
  const entries = Object.entries(row.value)
    .filter(([, value]) => value !== blankString)
    .map(([key, value]) => (
      <React.Fragment key={key}>
        <dt style={localStyles.config.dt}>{key}:</dt>
        <dd>{value ? value.toString() : '""'}</dd>
      </React.Fragment>
    ));

  return <dl>{entries}</dl>;
};

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
    editConfig: {
      type: 'json',
      default: '{}',
      visibilityCriteria: {
        service_type: values => ['dhis', 'superset'].includes(values.service_type),
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
        {
          label: 'Data element code',
          fieldName: 'dataElementCode',
          visibilityCriteria: { service_type: 'dhis' },
        },
        {
          label: 'Category option combo code',
          fieldName: 'categoryOptionCombo',
          visibilityCriteria: { service_type: 'dhis' },
        },
        {
          label: 'Superset Chart ID',
          fieldName: 'supersetChartId',
          visibilityCriteria: { service_type: 'superset' },
        },
      ],
    },
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
    displayUsedBy
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

export const DataElementsPage = ({ getHeaderEl }) => (
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
    displayUsedBy
  />
);

DataElementsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
