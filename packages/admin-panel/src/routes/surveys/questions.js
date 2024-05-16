/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const QUESTION_FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    editable: false,
  },
  {
    Header: 'Type',
    source: 'type',
    required: true,
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
    required: true,
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
    Header: 'Hook',
    source: 'hook',
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
    required: true,
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

const EDITOR_CONFIG = {
  displayUsedBy: true,
};

export const questions = {
  title: 'Questions',
  path: '/questions',
  endpoint: 'questions',
  columns: QUESTION_COLUMNS,
  isBESAdminOnly: true,
  editorConfig: EDITOR_CONFIG,
  getHasNestedView: ({ option_set_id: optionSetId }) => !!optionSetId,
  nestedView: {
    title: 'Options',
    endpoint: 'optionSets/{option_set_id}/options',
    columns: OPTION_COLUMNS,
    path: '/:id/options',
    displayProperty: 'code',
  },
};
