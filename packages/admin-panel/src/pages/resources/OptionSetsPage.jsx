/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

const OPTION_SET_FIELDS = [
  {
    Header: 'Name',
    source: 'name',
  },
];

const OPTION_SET_COLUMNS = [
  ...OPTION_SET_FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Option Set',
      editEndpoint: 'optionSets',
      fields: [...OPTION_SET_FIELDS],
    },
  },
];

const OPTION_FIELDS = [
  {
    Header: 'Value',
    source: 'value',
  },
  {
    Header: 'Label',
    source: 'label',
  },
  {
    Header: 'Sort Order',
    source: 'sort_order',
  },
  {
    Header: 'Attributes',
    source: 'attributes',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
];

const OPTION_COLUMNS = [
  ...OPTION_FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'options',
      fields: OPTION_FIELDS,
    },
  },
];

const EXPANSION_CONFIG = [
  {
    title: 'Options',
    endpoint: 'optionSets/{id}/options',
    columns: OPTION_COLUMNS,
  },
];

const IMPORT_CONFIG = {
  title: 'Import Option Sets',
  actionConfig: {
    importEndpoint: 'optionSets',
  },
  queryParameters: [
    {
      label: 'Option Set Names',
      secondaryLabel:
        'Please enter the names of the option sets to be imported. These should match the tab names in the file.',
      parameterKey: 'optionSetNames',
      optionsEndpoint: 'optionSets',
      optionValueKey: 'name',
      allowMultipleValues: true,
      canCreateNewOptions: true,
    },
  ],
};

export const OptionSetsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Option Sets"
    endpoint="optionSets"
    columns={OPTION_SET_COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    importConfig={IMPORT_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

OptionSetsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
