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

const EDIT_CONFIG = {
  title: 'Edit Option Set',
};

export const AccessRequestsPage = () => (
  <ResourcePage
    title="Access Requests"
    endpoint="optionSets"
    columns={OPTION_SET_COLUMNS}
    editConfig={EDIT_CONFIG}
  />
);
