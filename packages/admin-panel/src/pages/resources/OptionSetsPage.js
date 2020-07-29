import React from 'react';
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
      editEndpoint: 'optionSet',
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
];

const OPTION_COLUMNS = [
  ...OPTION_FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'option',
      fields: OPTION_FIELDS,
    },
  },
];

const EXPANSION_CONFIG = [
  {
    title: 'Options',
    endpoint: 'optionSet/{id}/options',
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

const EDIT_CONFIG = {
  title: 'Edit Option Set',
};

export const OptionSetsPage = props => (
  <ResourcePage
    title="Option Sets"
    endpoint="optionSets"
    columns={OPTION_SET_COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    importConfig={IMPORT_CONFIG}
    editConfig={EDIT_CONFIG}
    {...props}
  />
);
