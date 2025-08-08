import { SurveyEditFields } from '../../surveys/SurveyEditFields';
import { QUESTION_FIELDS as BASE_QUESTION_FIELDS } from './questions';
import { EditSurveyPage } from '../../pages/resources';

const { REACT_APP_DATATRAK_WEB_URL } = import.meta.env;

const RESOURCE_NAME = { singular: 'survey' };

const PERIOD_GRANULARITIES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
];

const SERVICE_TYPES = [
  { label: 'DHIS', value: 'dhis' },
  { label: 'Tupaia', value: 'tupaia' },
];

const SURVEY_FIELDS = {
  project: {
    Header: 'Project',
    source: 'project.code',
    required: true,
    editConfig: {
      sourceKey: 'project.code',
      optionsEndpoint: 'projects',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      allowMultipleValues: false,
      labelTooltip: 'Select the project this survey should be available in',
      required: true,
    },
  },
  name: {
    Header: 'Name',
    source: 'name',
    required: true,
    editConfig: {
      maxLength: 50,
      required: true,
    },
  },
  code: {
    Header: 'Code',
    source: 'code',
    required: true,
    editConfig: {
      labelTooltip: 'A short unique code. Suggestions appear when you enter a name.',
      required: true,
    },
  },
  country_ids: {
    Header: 'Countries',
    source: 'countryNames', // TODO: cleanup as part of RN-910
    required: true,
    editConfig: {
      type: 'checkboxList',
      sourceKey: 'countryNames',
      optionsEndpoint: 'countries',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      labelTooltip: 'Select the countries this survey should be available in',
      pageSize: 'ALL',
    },
  },
  permission_group_id: {
    Header: 'Permission group',
    source: 'permission_group.name', // TODO: cleanup as part of RN-910
    required: true,
    editConfig: {
      sourceKey: 'permission_group.name',
      optionsEndpoint: 'permissionGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      labelTooltip: 'Select the permission group this survey should be available for',
      required: true,
    },
  },
  survey_group_id: {
    Header: 'Survey group',
    source: 'survey_group.name', // TODO: cleanup as part of RN-910
    editConfig: {
      sourceKey: 'survey_group.name',
      optionsEndpoint: 'surveyGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      labelTooltip:
        'Select the survey group this survey should be a part of, or leave blank for none',
      canCreateNewOptions: true,
    },
  },
  can_repeat: {
    Header: 'Repeating',
    source: 'can_repeat',
    type: 'boolean',
    editConfig: {
      type: 'boolean',
    },
  },
  period_granularity: {
    Header: 'Reporting period',
    source: 'period_granularity',
    editConfig: {
      options: [{ label: 'None', value: '' }, ...PERIOD_GRANULARITIES],
      labelTooltip:
        'Select a reporting period if new responses should overwrite previous ones within the same period',
    },
  },
  requires_approval: {
    Header: 'Requires approval',
    source: 'requires_approval',
    type: 'boolean',
    editConfig: {
      type: 'boolean',
      labelTooltip:
        'Select whether survey responses require approval before their data appear in visualisations',
    },
  },
  'data_group.service_type': {
    Header: 'Data service',
    source: 'data_group.service_type',
    editConfig: {
      labelTooltip: 'Select the data service this survey should use',
      options: SERVICE_TYPES,
      setFieldsOnChange: (newValue, currentRecord = null) => {
        const { dhisInstanceCode = 'regional' } = currentRecord
          ? (currentRecord['data_group.config'] ?? {})
          : {};
        const config = newValue === 'dhis' ? { dhisInstanceCode } : {};
        return { 'data_group.config': config };
      },
    },
  },
  'data_group.config': {
    Header: 'Data service configuration',
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
                label: 'DHIS server',
                fieldName: 'dhisInstanceCode',
                optionsEndpoint: 'dhisInstances',
                optionLabelKey: 'code',
                optionValueKey: 'code',
                required: true,
              },
            ]
          : [],
    },
  },
  surveyQuestions: {
    Header: 'Survey questions',
    source: 'surveyQuestions',
    editConfig: {
      type: 'file',
      name: 'surveyQuestions',
      labelTooltip:
        'Import a questions spreadsheet to update the questions and screens of this survey.',
      accept: {
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      },
    },
  },
};

const SURVEY_COLUMNS = [
  SURVEY_FIELDS.project,
  SURVEY_FIELDS.name,
  SURVEY_FIELDS.code,
  {
    Header: 'Project ID',
    source: 'project.id',
    show: false,
  },
  {
    Header: 'countries',
    source: 'countryCodes',
    show: false,
  },
  {
    Header: 'Permission group',
    source: 'permission_group.name',
  },
  {
    Header: 'Survey group',
    source: 'survey_group.name',
  },
  {
    Header: 'View',
    type: 'externalLink',
    actionConfig: {
      generateUrl: row => {
        const { code, countryCodes } = row;
        if (!countryCodes || !countryCodes.some(countryCode => !!countryCode)) return null;
        const countryCodeToUse = countryCodes.includes('DL') ? 'DL' : countryCodes[0];
        return `${REACT_APP_DATATRAK_WEB_URL}/survey/${countryCodeToUse}/${code}/1`;
      },
      title: 'View in DataTrak',
    },
  },
  {
    Header: 'Export',
    type: 'export',
    actionConfig: {
      exportEndpoint: 'surveys',
      fileName: '{name}.xlsx',
    },
  },
  {
    Header: 'Edit',
    source: 'id',
    type: 'edit',
    colWidth: '4.5rem',
    filterable: false,
    disableSortBy: true,
    isButtonColumn: true,
    actionConfig: {
      title: `Edit ${RESOURCE_NAME.singular}`,
      editEndpoint: 'surveys',
      link: `/surveys/:id/edit`,
      fields: Object.values(SURVEY_FIELDS),
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: 'surveys',
    },
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: 'surveys',
    // All fields except Integration Metadata
    // (Only one project uses it, hidden to improve UX for everyone else, see MDEV-48)
    fields: [
      SURVEY_FIELDS.surveyQuestions,
      SURVEY_FIELDS.project,
      SURVEY_FIELDS.name,
      SURVEY_FIELDS.code,
      SURVEY_FIELDS.country_ids,
      SURVEY_FIELDS.permission_group_id,
      SURVEY_FIELDS.survey_group_id,
      SURVEY_FIELDS.can_repeat,
      SURVEY_FIELDS.period_granularity,
      SURVEY_FIELDS.requires_approval,
      SURVEY_FIELDS['data_group.service_type'],
      SURVEY_FIELDS['data_group.config'],
    ],
    // Custom component needed because on create we suggest the code
    FieldsComponent: SurveyEditFields,
    initialValues: {
      can_repeat: false,
      requires_approval: false,
      'data_group.service_type': 'tupaia',
      'data_group.config': {},
    },
  },
};

const QUESTION_FIELDS = BASE_QUESTION_FIELDS.map(field => ({
  ...field,
  source: `question.${field.source}`,
}));

const QUESTION_COLUMNS = [
  ...QUESTION_FIELDS,
  {
    Header: 'Config',
    source: 'config',
  },
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit question',
      editEndpoint: 'surveyScreenComponents',
      fields: [
        ...QUESTION_FIELDS,
        {
          Header: 'Config',
          source: 'config',
          editConfig: {
            type: 'json',
            getJsonFieldSchema: () => [
              {
                label: 'Entity',
                fieldName: 'entity',
                type: 'json',
                getJsonFieldSchema: () => [
                  {
                    label: 'Create new',
                    fieldName: 'createNew',
                    type: 'boolean',
                  },
                  {
                    label: 'Allow scan QR code',
                    fieldName: 'allowScanQrCode',
                    type: 'boolean',
                  },
                  {
                    label: 'Generate QR code',
                    fieldName: 'generateQrCode',
                    type: 'boolean',
                  },
                  {
                    label: 'Hide parent entity name',
                    fieldName: 'hideParentName',
                    type: 'boolean',
                  },
                  {
                    label: 'Filter',
                    fieldName: 'filter',
                    type: 'json',
                    getJsonFieldSchema: () => [
                      {
                        label: 'Accepted types (comma-separated values)',
                        fieldName: 'type',
                        csv: true,
                      },
                      {
                        label: 'Parent entity',
                        fieldName: 'parentId',
                        type: 'json',
                        getJsonFieldSchema: () => [
                          { label: 'Question Id', fieldName: 'questionId' },
                        ],
                      },
                      {
                        label: 'Grandparent entity',
                        fieldName: 'grandparentId',
                        type: 'json',
                        getJsonFieldSchema: () => [
                          { label: 'Question Id', fieldName: 'questionId' },
                        ],
                      },
                      {
                        label: 'Attributes',
                        fieldName: 'attributes',
                        type: 'json',
                        getJsonFieldSchema: () => [
                          {
                            label: 'Type',
                            fieldName: 'type',
                            type: 'json',
                            getJsonFieldSchema: () => [
                              { label: 'Question Id', fieldName: 'questionId' },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    label: 'Fields',
                    fieldName: 'fields',
                    type: 'json',
                    getJsonFieldSchema: () => [
                      {
                        label: 'Type',
                        fieldName: 'type',
                      },
                      {
                        label: 'Parent entity',
                        fieldName: 'parentId',
                        type: 'json',
                        getJsonFieldSchema: () => [
                          { label: 'Question Id', fieldName: 'questionId' },
                        ],
                      },
                      {
                        label: 'Attributes',
                        fieldName: 'attributes',
                        type: 'json',
                        getJsonFieldSchema: () => [
                          {
                            label: 'Type',
                            fieldName: 'type',
                            type: 'json',
                            getJsonFieldSchema: () => [
                              { label: 'Question Id', fieldName: 'questionId' },
                            ],
                          },
                        ],
                      },
                      {
                        label: 'Name',
                        fieldName: 'name',
                        type: 'json',
                        getJsonFieldSchema: () => [
                          { label: 'Question Id', fieldName: 'questionId' },
                        ],
                      },
                      {
                        label: 'Code',
                        fieldName: 'code',
                        type: 'json',
                        getJsonFieldSchema: () => [
                          { label: 'Question Id', fieldName: 'questionId' },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                label: 'Code generator',
                fieldName: 'codeGenerator',
                type: 'json',
                getJsonFieldSchema: () => [
                  { label: 'Type', fieldName: 'type' },
                  { label: 'Prefix', fieldName: 'prefix' },
                  { label: 'Length', fieldName: 'length' },
                ],
              },
              {
                label: 'Arithmetic',
                fieldName: 'arithmetic',
                type: 'json',
                getJsonFieldSchema: () => [
                  {
                    label: 'Formula',
                    fieldName: 'formula',
                  },
                  {
                    label: 'Default values',
                    fieldName: 'defaultValues',
                    type: 'jsonEditor',
                  },
                  {
                    label: 'Value translation',
                    fieldName: 'valueTranslation',
                    type: 'jsonEditor',
                  },
                  {
                    label: 'Answer display text',
                    fieldName: 'answerDisplayText',
                  },
                ],
              },
              {
                label: 'Condition',
                fieldName: 'condition',
                type: 'json',
                getJsonFieldSchema: () => [
                  {
                    label: 'Conditions',
                    fieldName: 'conditions',
                    type: 'jsonEditor',
                  },
                ],
              },
              {
                label: 'Autocomplete',
                fieldName: 'autocomplete',
                type: 'json',
                getJsonFieldSchema: () => [
                  {
                    label: 'Create New',
                    fieldName: 'createNew',
                    type: 'boolean',
                  },
                  {
                    label: 'Attributes',
                    fieldName: 'attributes',
                    type: 'json',
                    getJsonFieldSchema: () => [
                      {
                        label: 'Parent project',
                        fieldName: 'parent_project',
                        type: 'json',
                        getJsonFieldSchema: () => [
                          { label: 'Question Id', fieldName: 'questionId' },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                label: 'Task',
                fieldName: 'task',
                type: 'json',
                getJsonFieldSchema: () => [
                  {
                    label: 'Should create task',
                    fieldName: 'shouldCreateTask',
                    type: 'json',
                    getJsonFieldSchema: () => [{ label: 'Question Id', fieldName: 'questionId' }],
                  },
                  {
                    label: 'Entity ID',
                    fieldName: 'entityId',
                    type: 'json',
                    getJsonFieldSchema: () => [{ label: 'Question Id', fieldName: 'questionId' }],
                  },

                  {
                    label: 'Survey code',
                    fieldName: 'surveyCode',
                    optionsEndpoint: 'surveys',
                    optionLabelKey: 'name',
                    optionValueKey: 'code',
                    labelTooltip: 'Select the survey this task should be assigned for',
                  },
                  {
                    label: 'Due date',
                    fieldName: 'dueDate',
                    type: 'json',
                    getJsonFieldSchema: () => [{ label: 'Question Id', fieldName: 'questionId' }],
                  },

                  {
                    label: 'Assignee',
                    fieldName: 'assignee',
                    type: 'json',
                    getJsonFieldSchema: () => [{ label: 'Question Id', fieldName: 'questionId' }],
                  },
                ],
              },
              {
                label: 'User',
                fieldName: 'user',
                type: 'json',
                getJsonFieldSchema: () => [
                  {
                    label: 'Permission group name',
                    fieldName: 'permissionGroup',
                    optionsEndpoint: 'permissionGroups',
                    optionLabelKey: 'name',
                    optionValueKey: 'id',
                    labelTooltip: 'Select the permission group the user list should be filtered by',
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

export const surveys = {
  resourceName: RESOURCE_NAME,
  path: '',
  default: true,
  endpoint: 'surveys',
  columns: SURVEY_COLUMNS,
  createConfig: CREATE_CONFIG,
  nestedViews: [
    {
      path: '/:id/questions',
      endpoint: 'surveys/{id}/surveyScreenComponents',
      columns: QUESTION_COLUMNS,
      title: 'Questions',
      displayProperty: 'name', // gets used to determine what to display in the breadcrumbs
    },
    {
      path: '/:id/edit',
      Component: EditSurveyPage,
      getDisplayValue: () => 'Edit',
    },
  ],
};
