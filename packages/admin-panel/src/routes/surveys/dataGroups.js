import {
  DATA_ELEMENT_FIELDS,
  DATA_SOURCE_FIELDS,
  DataSourceConfigView,
  getDataSourceButtonsConfig,
} from '../../common';

const RESOURCE_NAME = { singular: 'data group' };

const DATA_GROUP_FIELDS = [
  ...DATA_SOURCE_FIELDS,
  {
    Header: 'Data service configuration',
    source: 'config',
    Cell: DataSourceConfigView,
    editConfig: {
      type: 'json',
      default: '{}',
      visibilityCriteria: {
        service_type: 'dhis',
      },
      getJsonFieldSchema: () => [
        {
          label: 'DHIS server',
          fieldName: 'dhisInstanceCode',
          optionsEndpoint: 'dhisInstances',
          optionLabelKey: 'dhisInstances.code',
          optionValueKey: 'dhisInstances.code',
          required: true,
          visibilityCriteria: { service_type: 'dhis' },
        },
      ],
    },
  },
];

const EDITOR_CONFIG = {
  displayUsedBy: true,
};

export const dataGroups = {
  resourceName: RESOURCE_NAME,
  endpoint: 'dataGroups',
  columns: [...DATA_GROUP_FIELDS, ...getDataSourceButtonsConfig(DATA_GROUP_FIELDS, 'dataGroup')],
  path: '/data-groups',
  createConfig: {
    actionConfig: {
      title: `New ${RESOURCE_NAME.singular}`,
      editEndpoint: 'dataGroups',
      fields: DATA_GROUP_FIELDS,
    },
  },
  editorConfig: EDITOR_CONFIG,
  isBESAdminOnly: true,
  nestedViews: [
    {
      resourceName: RESOURCE_NAME,
      endpoint: 'dataGroups/{id}/dataElements',
      columns: [
        ...DATA_ELEMENT_FIELDS,
        ...getDataSourceButtonsConfig(DATA_ELEMENT_FIELDS, 'dataElement'),
      ],
      path: '/:id/data-elements',
      displayProperty: 'code',
    },
  ],
};
