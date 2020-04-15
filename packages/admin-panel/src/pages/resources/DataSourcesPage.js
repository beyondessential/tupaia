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
      'text-align': 'right',
      'margin-right': '5px',
    },
  },
};

const dataSourceConfigView = row => {
  const entries = Object.entries(row.value).map(([key, value]) => (
    <React.Fragment key={key}>
      <dt style={localStyles.config.dt}>{key}:</dt>
      <dd>{value.toString()}</dd>
    </React.Fragment>
  ));

  return <dl>{entries}</dl>;
};

const DATA_ELEMENTS = 'DATA_ELEMENTS';
const PROGRAMS = 'PROGRAMS';

const TABS = {
  [DATA_ELEMENTS]: {
    title: 'Data Elements',
    endpoint: 'data_source',
    fields: [
      {
        Header: 'Code',
        source: 'code',
      },
      {
        Header: 'Service Type',
        source: 'service_type',
      },
      {
        Header: 'Config',
        source: 'config',
        Cell: row => dataSourceConfigView(row),
        editConfig: {
          type: 'json',
          getJsonFieldSchema: () => [
            {
              label: 'Regional Data',
              fieldName: 'isDataRegional',
              type: 'boolean',
            },
            {
              label: 'Data Element Code',
              fieldName: 'dataElementCode',
            },
            {
              label: 'Category Option Combo',
              fieldName: 'categoryOptionCombo',
            },
          ],
        },
      },
    ],
  },
  [PROGRAMS]: {
    title: 'Programs',
    endpoint: 'data_source',
    fields: [
      {
        Header: 'Code',
        source: 'code',
      },
      {
        Header: 'Service Type',
        source: 'service_type',
      },
    ],
  },
};

const getTabPage = tabName => {
  const { title, endpoint, fields } = TABS[tabName];
  if (!TABS[tabName]) {
    console.warn(`No tab with name '${tabName}' found.`); // eslint-disable-line no-console
  }

  return {
    title,
    component: (
      <ResourcePage
        title={title}
        endpoint={endpoint}
        columns={[
          ...fields,
          {
            Header: 'Edit',
            type: 'edit',
            source: 'id',
            actionConfig: {
              editEndpoint: 'data_source',
              fields: fields,
            },
          },
        ]}
        editConfig={{ title: 'Edit Data Source' }}
      />
    ),
  };
};

export const DataSourcesPage = () => (
  <TabsPage tabs={[getTabPage(DATA_ELEMENTS), getTabPage(PROGRAMS)]} />
);
