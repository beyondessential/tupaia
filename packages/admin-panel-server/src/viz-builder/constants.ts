export const DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM = {
  DASHBOARD_ITEM: 'dashboard-item',
  MAP_OVERLAY: 'map-overlay',
};

export type DashboardItemOrMapOverlayParamKeys = keyof typeof DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM;
export type DashboardItemOrMapOverlayParam = typeof DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM[DashboardItemOrMapOverlayParamKeys];
