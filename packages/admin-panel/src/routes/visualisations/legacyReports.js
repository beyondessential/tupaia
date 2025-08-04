import { BES_ADMIN_PERMISSION_GROUP } from '../../utilities/userAccess';

const RESOURCE_NAME = { singular: 'legacy report' };

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    required: true,
  },
  {
    Header: 'Data builder',
    source: 'data_builder',
    required: true,
  },
  {
    Header: 'Data builder config',
    source: 'data_builder_config',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
    required: true,
  },
  {
    Header: 'Data services',
    source: 'data_services',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: `Edit ${RESOURCE_NAME.singular}`,
      editEndpoint: 'legacyReports',
      fields: FIELDS,
    },
  },
];

export const legacyReports = {
  resourceName: RESOURCE_NAME,
  path: '/legacy-reports',
  endpoint: 'legacyReports',
  columns: COLUMNS,
  requiresSomePermissionGroup: [BES_ADMIN_PERMISSION_GROUP],
};
