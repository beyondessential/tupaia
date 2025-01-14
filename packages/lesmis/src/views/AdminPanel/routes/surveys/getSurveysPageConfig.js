import { surveys } from '@tupaia/admin-panel';
import { getBooleanSelectFilter, getColumnFilter } from '../../table/columnTypes';
import {
  getDeleteColumnConfigs,
  getDeleteConfigs,
  getBaseEditorConfigs,
  getImportConfigs,
} from '../helpers';

export const getSurveysPageConfig = translate => {
  const PERIOD_GRANULARITIES = [
    { label: translate('admin.daily'), value: 'daily' },
    { label: translate('admin.weekly'), value: 'weekly' },
    { label: translate('admin.monthly'), value: 'monthly' },
    { label: translate('admin.quarterly'), value: 'quarterly' },
    { label: translate('admin.yearly'), value: 'yearly' },
  ];

  const SERVICE_TYPES = [
    { label: 'DHIS', value: 'dhis' },
    { label: 'Tupaia', value: 'tupaia' },
  ];

  const SURVEY_FIELDS = [
    {
      Header: translate('admin.name'),
      source: 'name',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.code'),
      source: 'code',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.permissionGroup'),
      source: 'permission_group.name',
      editConfig: {
        optionsEndpoint: 'permissionGroups',
      },
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.surveyGroup'),
      source: 'survey_group.name',
      editConfig: {
        optionsEndpoint: 'surveyGroups',
      },
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.repeating'),
      source: 'can_repeat',
      type: 'boolean',
      editConfig: {
        type: 'boolean',
      },
      Filter: getBooleanSelectFilter(translate),
    },
    {
      Header: translate('admin.requiresApproval'),
      source: 'requires_approval',
      type: 'boolean',
      editConfig: {
        type: 'boolean',
      },
      Filter: getBooleanSelectFilter(translate),
    },
  ];

  const SURVEY_COLUMNS = [
    ...SURVEY_FIELDS,
    {
      Header: translate('admin.export'),
      type: 'export',
      actionConfig: {
        exportEndpoint: 'surveys',
        fileName: '{name}',
      },
    },
    {
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
      actionConfig: {
        title: translate('admin.edit'),
        editEndpoint: 'surveys',
        fields: [
          ...SURVEY_FIELDS,
          {
            Header: translate('admin.reportingPeriod'),
            source: 'period_granularity',
            editConfig: {
              options: [{ label: 'None', value: '' }, ...PERIOD_GRANULARITIES],
            },
          },
          {
            Header: translate('admin.dataService'),
            source: 'data_group.service_type',
            editConfig: {
              options: SERVICE_TYPES,
              setFieldsOnChange: (newValue, currentRecord) => {
                const { dhisInstanceCode = 'regional' } = currentRecord['data_group.config'];
                const config = newValue === 'dhis' ? { dhisInstanceCode } : {};
                return { 'data_group.config': config };
              },
            },
          },
          {
            Header: translate('admin.dataServiceConfiguration'),
            source: 'data_group.config',
            editConfig: {
              type: 'json',
              visibilityCriteria: {
                'data_group.service_type': 'dhis',
              },
              getJsonFieldSchema: (_, { recordData }) =>
                recordData['data_group.service_type'] === 'dhis'
                  ? [
                      {
                        label: 'DHIS Server',
                        fieldName: 'dhisInstanceCode',
                        optionsEndpoint: 'dhisInstances',
                        optionLabelKey: 'dhisInstances.code',
                        optionValueKey: 'dhisInstances.code',
                      },
                    ]
                  : [],
            },
          },
        ],
      },
    },
    getDeleteColumnConfigs('surveys', translate),
  ];

  const QUESTION_FIELDS = [
    {
      Header: translate('admin.code'),
      source: 'question.code',

      editable: false,
    },
    {
      Header: translate('admin.type'),
      source: 'question.type',
    },
    {
      Header: translate('admin.name'),
      source: 'question.name',
    },
    {
      Header: translate('admin.question'),
      source: 'question.text',
    },
    {
      Header: translate('admin.detail'),
      source: 'question.detail',
    },
    {
      Header: translate('admin.questionLabel'),
      source: 'question_label',
    },
    {
      Header: translate('admin.detailLabel'),
      source: 'detail_label',
    },
  ];

  const QUESTION_COLUMNS = [
    ...QUESTION_FIELDS,
    {
      Header: translate('admin.config'),
      source: 'config',
    },
    {
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
      actionConfig: {
        title: translate('edit'),
        editEndpoint: 'surveyScreenComponents',
        fields: [
          ...QUESTION_FIELDS,
          {
            Header: translate('admin.config'),
            source: 'config',
            editConfig: {
              type: 'json',
              getJsonFieldSchema: () => [
                {
                  label: translate('admin.entity'),
                  fieldName: 'entity',
                  type: 'json',
                  getJsonFieldSchema: () => [
                    {
                      label: translate('admin.acceptedTypes'),
                      fieldName: 'type',
                      csv: true,
                    },
                    {
                      label: translate('admin.createNew'),
                      fieldName: 'createNew',
                      type: 'boolean',
                    },
                    {
                      label: translate('admin.parentEntity'),
                      fieldName: 'parentId',
                      type: 'json',
                      getJsonFieldSchema: () => [
                        { label: translate('admin.questionId'), fieldName: 'questionId' },
                      ],
                    },
                    {
                      label: translate('admin.grandParentEntity'),
                      fieldName: 'grandparentId',
                      type: 'json',
                      getJsonFieldSchema: () => [
                        { label: translate('admin.questionId'), fieldName: 'questionId' },
                      ],
                    },
                    {
                      label: translate('admin.attributes'),
                      fieldName: 'attributes',
                      type: 'json',
                      getJsonFieldSchema: () => [
                        {
                          label: translate('admin.type'),
                          fieldName: 'type',
                          type: 'json',
                          getJsonFieldSchema: () => [
                            { label: translate('admin.questionId'), fieldName: 'questionId' },
                          ],
                        },
                      ],
                    },
                    {
                      label: translate('admin.name'),
                      fieldName: 'name',
                      type: 'json',
                      getJsonFieldSchema: () => [
                        { label: translate('admin.questionId'), fieldName: 'questionId' },
                      ],
                    },
                    {
                      label: translate('admin.code'),
                      fieldName: 'code',
                      type: 'json',
                      getJsonFieldSchema: () => [
                        { label: translate('admin.questionId'), fieldName: 'questionId' },
                      ],
                    },
                  ],
                },
                {
                  label: translate('admin.codeGenerator'),
                  fieldName: 'codeGenerator',
                  type: 'json',
                  getJsonFieldSchema: () => [
                    { label: translate('admin.type'), fieldName: 'type' },
                    { label: translate('admin.prefix'), fieldName: 'prefix' },
                    { label: translate('admin.length'), fieldName: 'length' },
                  ],
                },
                {
                  label: translate('admin.arithmetic'),
                  fieldName: 'arithmetic',
                  type: 'json',
                  getJsonFieldSchema: () => [
                    {
                      label: translate('admin.formula'),
                      fieldName: 'formula',
                    },
                    {
                      label: translate('admin.defaultValues'),
                      fieldName: 'defaultValues',
                      type: 'jsonEditor',
                    },
                    {
                      label: translate('admin.valueTranslation'),
                      fieldName: 'valueTranslation',
                      type: 'jsonEditor',
                    },
                    {
                      label: translate('admin.answerDisplayText'),
                      fieldName: 'answerDisplayText',
                    },
                  ],
                },
                {
                  label: translate('admin.condition'),
                  fieldName: 'condition',
                  type: 'json',
                  getJsonFieldSchema: () => [
                    {
                      label: translate('admin.conditions'),
                      fieldName: 'conditions',
                      type: 'jsonEditor',
                    },
                  ],
                },
                {
                  label: translate('admin.autocomplete'),
                  fieldName: 'autocomplete',
                  type: 'json',
                  getJsonFieldSchema: () => [
                    {
                      label: translate('admin.createNew'),
                      fieldName: 'createNew',
                      type: 'boolean',
                    },
                    {
                      label: translate('admin.attributes'),
                      fieldName: 'attributes',
                      type: 'json',
                      getJsonFieldSchema: () => [
                        {
                          label: translate('admin.parentProject'),
                          fieldName: 'parent_project',
                          type: 'json',
                          getJsonFieldSchema: () => [
                            { label: translate('admin.questionId'), fieldName: 'questionId' },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  ];

  const IMPORT_CONFIG = getImportConfigs(translate, {
    actionConfig: {
      importEndpoint: 'surveys',
    },
    queryParameters: [
      {
        label: translate('admin.surveyNames'),
        secondaryLabel:
          'Please enter the names of the surveys to be imported. These should match the tab names in the file.',
        parameterKey: 'surveyNames',
        value: translate('admin.startTypingToSearch'),
        optionsEndpoint: 'surveys',
        optionValueKey: 'name',
        allowMultipleValues: true,
        canCreateNewOptions: true,
      },
      {
        label: translate('admin.countries'),
        secondaryLabel:
          'Select the countries this survey should be available in, or leave blank for all',
        parameterKey: 'countryIds',
        optionsEndpoint: 'countries',
        allowMultipleValues: true,
      },
      {
        label: translate('admin.permissionGroup'),
        secondaryLabel:
          'Select the permission group this survey should be available for, or leave blank for Public',
        parameterKey: 'permissionGroup',
        optionsEndpoint: 'permissionGroups',
        optionValueKey: 'name',
      },
      {
        label: translate('admin.surveyGroup'),
        secondaryLabel:
          'Select the survey group this survey should be a part of, or leave blank for none',
        parameterKey: 'surveyGroup',
        optionsEndpoint: 'surveyGroups',
        canCreateNewOptions: true,
        optionValueKey: 'name',
      },
      {
        label: translate('admin.reportingPeriod'),
        secondaryLabel:
          'Select a reporting period if new responses should overwrite previous ones within the same period',
        placeholder: translate('admin.pleaseSelect'),
        parameterKey: 'periodGranularity',
        options: PERIOD_GRANULARITIES,
      },
      {
        label: translate('admin.requiresApproval'),
        secondaryLabel:
          'Select whether survey responses require approval before their data appear in visualisations',
        parameterKey: 'requiresApproval',
        type: 'boolean',
      },
      {
        label: translate('admin.dataService'),
        secondaryLabel: 'Select the data service this survey should use, or leave blank for tupaia',
        parameterKey: 'serviceType',
        options: SERVICE_TYPES,
      },
      {
        label: 'DHIS Server',
        parameterKey: 'dhisInstanceCode',
        optionsEndpoint: 'dhisInstances',
        optionLabelKey: 'dhisInstances.code',
        optionValueKey: 'dhisInstances.code',
        visibilityCriteria: { serviceType: 'dhis' },
      },
    ],
  });

  return {
    ...surveys,
    label: translate('admin.surveys'),
    columns: SURVEY_COLUMNS,
    importConfig: IMPORT_CONFIG,
    deleteConfig: getDeleteConfigs(translate),
    editorConfig: getBaseEditorConfigs(translate),
    nestedViews: [
      {
        ...surveys.nestedViews[0],
        label: translate('admin.questions'),
        columns: QUESTION_COLUMNS,
      },
    ],
  };
};
