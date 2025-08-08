import React from 'react';
import { Link } from 'react-router-dom';
import { AddCircle } from '@material-ui/icons';
import { dashboardItems, ActionButton } from '@tupaia/admin-panel';
import { getColumnFilter } from '../../table/columnTypes';
import {
  getBaseEditorConfigs,
  getDeleteColumnConfigs,
  getDeleteConfigs,
  getImportConfigs,
} from '../helpers';

export const DASHBOARD_ITEMS_ENDPOINT = 'dashboardItems';

export const getDashboardItemsPageConfig = (translate, adminUrl, isBESAdmin) => {
  const FIELDS = [
    {
      Header: translate('admin.code'),
      source: 'code',

      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.reportCode'),
      source: 'report_code',

      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.config'),
      source: 'config',
      type: 'jsonTooltip',
      Filter: getColumnFilter(translate),
      editConfig: { type: 'jsonEditor' },
    },
    {
      Header: translate('admin.legacy'),
      source: 'legacy',
      type: 'boolean',
      editConfig: { type: 'boolean' },
    },
  ];
  const extraEditFields = [
    // ID field for constructing viz-builder path only, not for showing or editing
    {
      Header: 'ID',
      source: 'id',
      show: false,
    },
    {
      Header: 'Edit using Visualisation Builder',
      type: 'link',
      show: isBESAdmin,
      editConfig: {
        type: 'link',
        linkOptions: {
          path: `${adminUrl}/viz-builder/dashboard-item/:id`,
          parameters: { id: 'id' },
        },
        visibilityCriteria: {
          legacy: false,
        },
      },
    },
  ];

  const columns = [
    ...FIELDS,
    {
      Header: translate('admin.export'),
      type: 'export',
      actionConfig: {
        exportEndpoint: 'dashboardVisualisation',
        fileName: '{code}',
      },
    },
    {
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
      actionConfig: {
        title: translate('admin.edit'),
        editEndpoint: DASHBOARD_ITEMS_ENDPOINT,
        fields: [...FIELDS, ...extraEditFields],
      },
    },
    getDeleteColumnConfigs(DASHBOARD_ITEMS_ENDPOINT, translate),
  ];

  const importConfig = getImportConfigs(translate, {
    ...dashboardItems.importConfig,
    getFinishedMessage: response => (
      <>
        <span>{response.message}</span>
        {response.importedVizes.map(({ code, id }) => (
          <p>
            <span>{`${code}: `}</span>
            <Link to={`${adminUrl}/viz-builder/dashboard-item/${id}`}>
              View in Visualisation Builder
            </Link>
          </p>
        ))}
      </>
    ),
  });

  const renderNewDashboardVizButton = () => (
    <ActionButton
      to={`${adminUrl}/viz-builder/dashboard-item/new`}
      component={Link}
      startIcon={<AddCircle />}
    >
      {translate('admin.new')}
    </ActionButton>
  );

  const editorConfig = getBaseEditorConfigs(translate);
  const deleteConfig = getDeleteConfigs(translate);

  return {
    ...dashboardItems,
    label: translate('admin.dashboardItems'),
    columns,
    importConfig,
    editorConfig,
    deleteConfig,
    LinksComponent: renderNewDashboardVizButton,
    needsBESAdminAccess: [],
  };
};
