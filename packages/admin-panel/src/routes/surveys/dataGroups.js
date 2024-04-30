import {
  DATA_ELEMENT_FIELDS,
  DATA_SOURCE_FIELDS,
  DataSourceConfigView,
  getDataSourceButtonsConfig,
} from '../../common';

const DATA_GROUP_FIELDS = [
  ...DATA_SOURCE_FIELDS,
  {
    Header: 'Data Service Configuration',
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
          label: 'DHIS Server',
          fieldName: 'dhisInstanceCode',
          optionsEndpoint: 'dhisInstances',
          optionLabelKey: 'dhisInstances.code',
          optionValueKey: 'dhisInstances.code',
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
  title: 'Data groups',
  endpoint: 'dataGroups',
  columns: [...DATA_GROUP_FIELDS, ...getDataSourceButtonsConfig(DATA_GROUP_FIELDS, 'dataGroup')],
  url: '/data-groups',
  createConfig: {
    title: 'New Data Group',
    actionConfig: {
      title: 'Edit Data Group',
      editEndpoint: 'dataGroups',
      fields: [...DATA_GROUP_FIELDS],
    },
  },
  editorConfig: EDITOR_CONFIG,
  detailsView: {
    title: 'Data elements',
    endpoint: 'dataGroups/{id}/dataElements',
    columns: [
      ...DATA_ELEMENT_FIELDS,
      ...getDataSourceButtonsConfig(DATA_ELEMENT_FIELDS, 'dataElement'),
    ],
    url: '/:id/data-elements',
    displayProperty: 'code',
  },
};
