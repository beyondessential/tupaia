/**
 * Tupaia MediTrak
 * Copyright (c) 2022 Beyond Essential Systems Pty Ltd
 */

import { getColumnFilter } from '../../table/columnTypes/getColumnFilter';

export const getQuestionPageConfigs = translate => {
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
  ];

  const QUESTION_COLUMNS = [
    ...QUESTION_FIELDS,
    {
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
      actionConfig: {
        title: translate('admin.editQuestion'),
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

  const EXPANSION_CONFIG = [
    {
      title: translate('admin.options'),
      endpoint: 'optionSets/{option_set_id}/options',
      columns: OPTION_COLUMNS,
    },
  ];

  const EDITOR_CONFIG = {
    displayUsedBy: true,
    usedByConfig: {
      header: 'Used by',
      typeHeadings: {
        question: translate('admin.questions'),
        indicator: 'Indicators',
        dashboardItem: translate('admin.dashboardItems'),
        mapOverlay: translate('admin.mapOverlays'),
        legacyReport: 'Legacy Reports',
        dataGroup: translate('admin.dataGroups'),
        survey: translate('admin.surveys'),
      },
    },
  };

  return { QUESTION_COLUMNS, EXPANSION_CONFIG, EDITOR_CONFIG };
};
