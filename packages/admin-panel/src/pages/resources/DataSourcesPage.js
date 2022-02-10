/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

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
        <dd>{value.toString()}</dd>
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
    Header: 'Service Type',
    source: 'service_type',
    editConfig: { default: 'dhis' },
  },
];
const DATA_ELEMENT_FIELDS = [
  ...DATA_SOURCE_FIELDS,
  {
    Header: 'Config',
    source: 'config',
    Cell: DataSourceConfigView,
    editConfig: {
      type: 'json',
      default: '{}',
      getJsonFieldSchema: () => [
        {
          label: 'Regional Server (Choose "No" if stored on country specific server)',
          fieldName: 'isDataRegional',
          type: 'boolean',
        },
        {
          label: 'Data element code',
          fieldName: 'dataElementCode',
        },
        {
          label: 'Category option combo code',
          fieldName: 'categoryOptionCombo',
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
    Header: 'Config',
    source: 'config',
    Cell: DataSourceConfigView,
    editConfig: {
      type: 'json',
      default: '{}',
      getJsonFieldSchema: () => [
        {
          label: 'Regional Server (Choose "No" if stored on country specific server)',
          fieldName: 'isDataRegional',
          type: 'boolean',
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
    editConfig={{ title: 'Edit Data Source' }}
    createConfig={{
      title: 'New Data Group',
      actionConfig: {
        editEndpoint: 'dataElements',
        fields: [...DATA_GROUP_FIELDS],
      },
    }}
    getHeaderEl={getHeaderEl}
    displayUsedBy
  />
);

DataGroupsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};

export const DataElementsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Data Elements"
    endpoint="dataElements"
    reduxId="dataElements"
    columns={[...DATA_ELEMENT_FIELDS, ...getButtonsConfig(DATA_ELEMENT_FIELDS, 'dataElement')]}
    editConfig={{ title: 'Edit Data Source' }}
    createConfig={{
      title: 'New Data Element',
      actionConfig: {
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
