/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

const QUESTION_FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    editable: false,
  },
  {
    Header: 'Type',
    source: 'type',
  },
  {
    Header: 'Name',
    source: 'name',
    type: 'tooltip',
  },
  {
    Header: 'Question',
    source: 'text',
    type: 'tooltip',
  },
  {
    Header: 'Legacy Options',
    source: 'options',
    type: 'tooltip',
  },
  {
    Header: 'Detail',
    source: 'detail',
    type: 'tooltip',
  },
  {
    Header: 'Option Set Id',
    source: 'option_set_id',
    show: false,
  },
];

const QUESTION_COLUMNS = [
  ...QUESTION_FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'question',
      fields: QUESTION_FIELDS,
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
    endpoint: 'optionSet/{option_set_id}/options',
    columns: OPTION_COLUMNS,
  },
];

const EDIT_CONFIG = {
  title: 'Edit Question',
};

export const QuestionsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Questions"
    endpoint="questions"
    columns={QUESTION_COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    editConfig={EDIT_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

QuestionsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
