/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { visualisationsTabRoutes } from '@tupaia/admin-panel';
import { getDashboardItemsPageConfig } from './getDashboardItemsPageConfig';

export const getVisualisationsTabsRoutes = (translate, adminUrl, isBESAdmin) => ({
  ...visualisationsTabRoutes,
  label: translate('admin.visualisations'),
  childViews: [
    getDashboardItemsPageConfig(translate, adminUrl, isBESAdmin),
    // {
    //   title: translate('admin.dashboardItems'),
    //   path: '',
    //   component: props => <DashboardItemsPage {...props} vizBuilderBaseUrl={adminUrl} />,
    // },
    // {
    //   title: translate('admin.dashboards'),
    //   path: '/dashboards',
    //   component: DashboardsPage,
    // },
    // {
    //   title: translate('admin.dashboardRelations'),
    //   path: '/dashboard-relations',
    //   component: DashboardRelationsPage,
    // },
    // {
    //   title: translate('admin.mapOverlays'),
    //   path: '/map-overlays',
    //   component: props => <MapOverlaysPage {...props} vizBuilderBaseUrl={adminUrl} />,
    // },
    // {
    //   title: translate('admin.mapOverlayGroups'),
    //   path: '/map-overlay-groups',
    //   component: MapOverlayGroupsPage,
    // },
    // {
    //   title: translate('admin.mapOverlayGroupRelations'),
    //   path: '/map-overlay-group-relations',
    //   component: MapOverlayGroupRelationsPage,
    // },
    // {
    //   title: translate('admin.dataTables'),
    //   path: '/dataTables',
    //   component: DataTablesPage,
    // },
  ],
});
