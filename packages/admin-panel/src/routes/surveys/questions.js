import { BASE_OPTION_FIELDS } from './optionSets';

const RESOURCE_NAME = { singular: 'question' };

export const QUESTION_FIELDS = [
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
  },
  {
    Header: 'Question',
    source: 'text',
    required: true,
  },
  {
    Header: 'Legacy options',
    source: 'options',
    editConfig: {
      type: 'jsonArray',
    },
  },
  {
    Header: 'Detail',
    source: 'detail',
  },
  {
    Header: 'Hook',
    source: 'hook',
  },
  {
    Header: 'Option set ID',
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
      title: 'Edit question',
      editEndpoint: 'questions',
      fields: QUESTION_FIELDS,
      displayUsedBy: true,
      recordType: 'question',
    },
  },
];

const OPTION_COLUMNS = [
  ...BASE_OPTION_FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'options',
      fields: BASE_OPTION_FIELDS,
    },
  },
];

const EDITOR_CONFIG = {
  displayUsedBy: true,
};

export const questions = {
  resourceName: RESOURCE_NAME,
  path: '/questions',
  endpoint: 'questions',
  columns: QUESTION_COLUMNS,
  isBESAdminOnly: true,
  editorConfig: EDITOR_CONFIG,
  nestedViews: [
    {
      title: 'Options',
      resourceName: { singular: 'option' },
      endpoint: 'optionSets/{option_set_id}/options',
      columns: OPTION_COLUMNS,
      path: '/:id/options',
      displayProperty: 'code',
      getHasNestedView: ({ option_set_id: optionSetId }) => !!optionSetId,
    },
  ],
};
