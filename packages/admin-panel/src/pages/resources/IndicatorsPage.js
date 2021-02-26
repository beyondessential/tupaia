/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    width: 300,
  },
  {
    Header: 'Builder',
    source: 'builder',
    width: 170,
    editConfig: {
      optionsEndpoint: 'indicators',
      optionLabelKey: 'builder',
      optionValueKey: 'builder',
      sourceKey: 'builder',
    },
  },
  {
    Header: 'Config',
    source: 'config',
    type: 'jsonTooltip',
    editConfig: {
      type: 'jsonEditor',
      default: '{ "formula": "", "aggregation": { "" : "" } }',
      getJsonFieldSchema: () => [
        {
          label: 'Formula',
          fieldName: 'formula',
        },
        {
          label: 'Aggregation',
          fieldName: 'aggregation',
          type: 'object',
        },
      ],
    },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    width: 70,
    actionConfig: {
      editEndpoint: 'indicators',
      fields: [...FIELDS],
    },
  },
];

const EDIT_CONFIG = {
  title: 'Edit Indicator',
};

const CREATE_CONFIG = {
  title: 'Add Indicator',
  actionConfig: {
    editEndpoint: 'indicators',
    fields: FIELDS,
  },
};

export const IndicatorsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Indicators"
    endpoint="indicators"
    columns={COLUMNS}
    editConfig={EDIT_CONFIG}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

IndicatorsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
