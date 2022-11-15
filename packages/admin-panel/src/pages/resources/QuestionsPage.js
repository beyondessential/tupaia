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
    editConfig: {
      type: 'jsonArray',
    },
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
      title: 'Edit Question',
      editEndpoint: 'questions',
      fields: QUESTION_FIELDS,
      displayUsedBy: true,
      recordType: 'question',
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
      editEndpoint: 'options',
      fields: OPTION_FIELDS,
    },
  },
];

const EXPANSION_CONFIG = [
  {
    title: 'Options',
    endpoint: 'optionSets/{option_set_id}/options',
    columns: OPTION_COLUMNS,
  },
];

export const QuestionsPage = ({ getHeaderEl, ...restOfProps }) => (
  <ResourcePage
    title="Questions"
    endpoint="questions"
    columns={QUESTION_COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    getHeaderEl={getHeaderEl}
    displayUsedBy
    {...restOfProps}
  />
);

QuestionsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
