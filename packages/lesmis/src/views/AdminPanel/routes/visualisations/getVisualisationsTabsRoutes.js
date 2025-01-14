import { visualisationsTabRoutes, dataTables } from '@tupaia/admin-panel';
import { getDashboardItemsPageConfig } from './getDashboardItemsPageConfig';
import { getDashboardsPageConfig } from './getDashboardsPageConfig';
import { getDashboardRelationsPageConfig } from './getDashboardRelationsPageConfig';
import { getMapOverlaysPageConfig } from './getMapOverlaysPageConfig';
import { getMapOverlayGroupsPageConfig } from './getMapOverlayGroupsPageConfig';
import { getMapOverlayGroupRelationsPageConfig } from './getMapOverlayGroupRelationsPageConfig';

export const getVisualisationsTabsRoutes = (translate, adminUrl, isBESAdmin) => ({
  ...visualisationsTabRoutes,
  label: translate('admin.visualisations'),
  childViews: [
    getDashboardItemsPageConfig(translate, adminUrl, isBESAdmin),
    getDashboardsPageConfig(translate),
    getDashboardRelationsPageConfig(translate),
    getMapOverlaysPageConfig(translate, adminUrl, isBESAdmin),
    getMapOverlayGroupsPageConfig(translate),
    getMapOverlayGroupRelationsPageConfig(translate),
    {
      ...dataTables,
      isBESAdminOnly: false,
    },
  ],
});
