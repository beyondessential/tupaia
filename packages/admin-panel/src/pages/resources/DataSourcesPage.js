/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

import { ResourcePage } from './ResourcePage';
import { TabsPage } from '../TabsPage';

const DATA_ELEMENTS = 'DATA_ELEMENTS';
const PROGRAMS = 'PROGRAMS';

const EDIT_CONFIG = {
  title: 'Edit Data Source',
};

const TABS = {
  [DATA_ELEMENTS]: {
    title: 'Data Elements',
    endpoint: 'data_source',
    fields: [
      {
        Header: 'Code',
        source: 'data_source.code',
      },
      {
        Header: 'Service Type',
        source: 'data_source.service_type',
      },
      {
        Header: 'Config',
        source: 'data_source.config',
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
        source: 'data_source.code',
      },
      {
        Header: 'Service Type',
        source: 'data_source.service_type',
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
              editEndpoint: 'data_sources',
              fields: fields,
            },
          },
        ]}
        editConfig={EDIT_CONFIG}
      />
    ),
  };
};

export const DataSourcesPage = () => (
  <TabsPage tabs={[getTabPage(DATA_ELEMENTS), getTabPage(PROGRAMS)]} />
);
