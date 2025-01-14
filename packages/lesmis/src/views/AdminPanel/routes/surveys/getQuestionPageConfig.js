import { questions } from '@tupaia/admin-panel';
import { getColumnFilter } from '../../table/columnTypes/getColumnFilter';
import { getEditorConfigs } from '../helpers/getEditorConfigs';

export const getQuestionPageConfig = translate => {
  const QUESTION_FIELDS = [
    {
      Header: translate('admin.code'),
      source: 'code',
      editable: false,
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.type'),
      source: 'type',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.name'),
      source: 'name',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.question'),
      source: 'text',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.legacyOptions'),
      source: 'options',
      Filter: getColumnFilter(translate),
      editConfig: {
        type: 'jsonArray',
      },
    },
    {
      Header: translate('admin.detail'),
      source: 'detail',
      Filter: getColumnFilter(translate),
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
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
      actionConfig: {
        title: translate('admin.edit'),
        editEndpoint: 'questions',
        fields: QUESTION_FIELDS,
        displayUsedBy: true,
        recordType: 'question',
      },
    },
  ];

  const OPTION_FIELDS = [
    {
      Header: translate('admin.value'),
      source: 'value',
    },
    {
      Header: translate('admin.label'),
      source: 'label',
    },
    {
      Header: translate('admin.sortOrder'),
      source: 'sort_order',
    },
  ];

  const OPTION_COLUMNS = [
    ...OPTION_FIELDS,
    {
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
      actionConfig: {
        editEndpoint: 'options',
        fields: OPTION_FIELDS,
      },
    },
  ];

  const EDITOR_CONFIG = getEditorConfigs(translate);

  return {
    ...questions,
    label: translate('admin.questions'),
    columns: QUESTION_COLUMNS,
    editorConfig: EDITOR_CONFIG,
    nestedViews: [
      {
        ...questions.nestedViews[0],
        label: translate('admin.options'),
        columns: OPTION_COLUMNS,
      },
    ],
  };
};
