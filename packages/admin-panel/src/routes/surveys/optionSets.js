import { capitalizeFirst, getPluralForm } from '../../pages/resources/resourceName';

const RESOURCE_NAME = { singular: 'option set' };

const OPTION_SET_FIELDS = [
  {
    Header: 'Name',
    source: 'name',
    required: true,
  },
];

const OPTION_SET_COLUMNS = [
  ...OPTION_SET_FIELDS,
  {
    Header: 'Export',
    type: 'export',
    actionConfig: {
      exportEndpoint: 'optionSets',
      fileName: '{name}.xlsx',
    },
  },
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: `Edit ${RESOURCE_NAME.singular}`,
      editEndpoint: 'optionSets',
      fields: OPTION_SET_FIELDS,
    },
  },
];

export const BASE_OPTION_FIELDS = [
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
    Header: 'Sort order',
    source: 'sort_order',
  },
];

const OPTION_FIELDS = [
  ...BASE_OPTION_FIELDS,
  {
    Header: 'Attributes',
    source: 'attributes',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
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

const IMPORT_CONFIG = {
  title: `Import ${getPluralForm(RESOURCE_NAME)}`,
  actionConfig: {
    importEndpoint: 'optionSets',
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  },
  queryParameters: [
    {
      label: `${capitalizeFirst(RESOURCE_NAME.singular)} names`,
      labelTooltip: `Please enter the names of the ${getPluralForm(
        RESOURCE_NAME,
      )} to be imported. These should match the tab names in the file.`,
      parameterKey: 'optionSetNames',
      optionsEndpoint: 'optionSets',
      optionValueKey: 'name',
      allowMultipleValues: true,
      canCreateNewOptions: true,
    },
  ],
};

export const optionSets = {
  resourceName: RESOURCE_NAME,
  endpoint: 'optionSets',
  columns: OPTION_SET_COLUMNS,
  importConfig: IMPORT_CONFIG,
  path: '/option-sets',
  nestedViews: [
    {
      title: 'Options',
      endpoint: 'optionSets/{id}/options',
      resourceName: { singular: 'option' },
      columns: OPTION_COLUMNS,
      path: '/:id/options',
      displayProperty: 'name',
    },
  ],
};
