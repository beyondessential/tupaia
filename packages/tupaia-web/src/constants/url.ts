export const URL_SEARCH_PARAMS = {
  PROJECT: 'project',
  TAB: 'tab',
  PASSWORD_RESET_TOKEN: 'passwordResetToken',
  MAP_OVERLAY: 'overlay',
  MAP_OVERLAY_PERIOD: 'overlayPeriod',
  REPORT: 'report',
  REPORT_PERIOD: 'reportPeriod',
  REPORT_DRILLDOWN_ID: 'reportDrillDownId',
  ONE_TIME_LOGIN_TOKEN: 'loginToken',
};

export enum MODAL_ROUTES {
  PROJECTS = 'projects',
  PROJECT_SELECT = 'project-select',
  LOGIN = 'login',
  REGISTER = 'register',
  FORGOT_PASSWORD = 'forgot-password',
  RESET_PASSWORD = 'reset-password',
  REQUEST_PROJECT_ACCESS = 'request-project-access',
  VERIFY_EMAIL_RESEND = 'verify-email-resend',
}

export const DEFAULT_PROJECT_ENTITY = '/explore/explore';
export const DEFAULT_URL = `${DEFAULT_PROJECT_ENTITY}/General`;

export enum TABS {
  MAP = 'map',
  DASHBOARD = 'dashboard',
}
export const DEFAULT_PERIOD_PARAM_STRING = 'DEFAULT_PERIOD';

export const DEFAULT_MAP_OVERLAY_ID = '126'; // 'Operational Facilities'

export const ROUTE_STRUCTURE = '/:projectCode/:entityCode/:dashboardName';

export const MAP_OVERLAY_EXPORT_ROUTE = '/:projectCode/:entityCode/map-overlay-pdf-export';
