import {
  DATA_ELEMENT_FIELDS,
  DATA_SOURCE_FIELDS,
  DataSourceConfigView,
  getDataSourceButtonsConfig,
} from '../../common';
import { BES_ADMIN_PERMISSION_GROUP } from '../../utilities/userAccess';
import { RESOURCE_NAME as DATA_ELEMENT_RESOURCE_NAME } from './dataElements';

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
      editEndpoint: 'dataGroups',
      fields: DATA_GROUP_FIELDS,
    },
  },
  editorConfig: EDITOR_CONFIG,
  requiresSomePermissionGroup: [BES_ADMIN_PERMISSION_GROUP],
  nestedViews: [
    {
      resourceName: DATA_ELEMENT_RESOURCE_NAME,
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
