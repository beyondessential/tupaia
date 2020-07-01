/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

import { ResourcePage } from './ResourcePage';
import { TabsPage } from '../TabsPage';

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
  const entries = Object.entries(row.value).map(([key, value]) => (
    <React.Fragment key={key}>
      <dt style={localStyles.config.dt}>{key}:</dt>
      <dd>{value.toString()}</dd>
    </React.Fragment>
  ));

  return <dl>{entries}</dl>;
};

const getButtonsConfig = fields => [
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'dataSource',
      fields: fields,
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: 'dataSource',
    },
  },
];

const DATA_ELEMENTS = 'DATA_ELEMENTS';
const DATA_GROUPS = 'DATA_GROUPS';
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

const TABS = {
  [DATA_ELEMENTS]: {
    title: 'Data Elements',
    endpoint: 'dataSources',
    baseFilter: { type: { comparisonValue: 'dataElement' } },
    fields: DATA_ELEMENT_FIELDS,
    createConfig: {
      title: 'New Data Element',
      actionConfig: {
        editEndpoint: 'dataSource',
        fields: [
          ...DATA_ELEMENT_FIELDS,
          {
            Header: 'Type',
            source: 'type',
            editConfig: { default: 'dataElement' },
            show: false,
          },
        ],
      },
    },
  },
  [DATA_GROUPS]: {
    title: 'Data Groups',
    endpoint: 'dataSources',
    baseFilter: { type: { comparisonValue: 'dataGroup' } },
    fields: DATA_GROUP_FIELDS,
    createConfig: {
      title: 'New Data Group',
      actionConfig: {
        editEndpoint: 'dataSource',
        fields: [
          ...DATA_GROUP_FIELDS,
          {
            Header: 'Type',
            source: 'type',
            editConfig: { default: 'dataGroup' },
            show: false,
          },
        ],
      },
    },
    expansionTabs: [
      {
        title: 'Data Elements',
        endpoint: 'data_source/{id}/data_source',
        columns: [...DATA_ELEMENT_FIELDS, ...getButtonsConfig(DATA_ELEMENT_FIELDS)],
      },
    ],
  },
};

const getTabPage = tabName => {
  const { title, endpoint, fields, baseFilter, expansionTabs, createConfig } = TABS[tabName];
  if (!TABS[tabName]) {
    console.warn(`No tab with name '${tabName}' found.`); // eslint-disable-line no-console
  }

  return {
    title,
    component: (
      <ResourcePage
        key={tabName}
        title={title}
        endpoint={endpoint}
        columns={[...fields, ...getButtonsConfig(fields)]}
        expansionTabs={expansionTabs}
        editConfig={{ title: 'Edit Data Source' }}
        baseFilter={baseFilter}
        createConfig={createConfig}
      />
    ),
  };
};

export const DataSourcesPage = () => (
  <TabsPage tabs={[getTabPage(DATA_ELEMENTS), getTabPage(DATA_GROUPS)]} />
);
