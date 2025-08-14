// Project Data Constants
export const PROJECT_CODE = 'laos_schools';
export const COUNTRY_CODE = 'LA';

// Permissions
export const ADMIN_PANEL_PERMISSION_GROUP = 'Tupaia Admin Panel';

// Dashboard Tab View Names
export const DASHBOARD_REPORT_TAB_VIEW = 'DashboardReportTabView';
export const FAVOURITE_DASHBOARD_TAB_VIEW = 'FavouriteDashboardTabView';
export const TAB_TEMPLATE = 'TabTemplate';

export const PROFILE_DASHBOARD_CODE = 'profile';
export const FAVOURITES_DASHBOARD_CODE = 'favourites';

// Dashboard Constants
export const DROPDOWN_OPTIONS = [
  {
    value: PROFILE_DASHBOARD_CODE,
    tabViewType: DASHBOARD_REPORT_TAB_VIEW,
    useYearSelector: true,
    exportToPDF: true,
  },
  {
    value: FAVOURITES_DASHBOARD_CODE,
    tabViewType: FAVOURITE_DASHBOARD_TAB_VIEW,
    labelCode: 'dashboards.favourites',
    exportToPDF: true,
  },
  {
    value: 'ESSDP_Plan',
    tabViewType: TAB_TEMPLATE,
    labelCode: 'dashboards.essdpPlan202125M&eFramework',
    componentPropConfig: {
      body: '9th Education Sector and Sports Development Plan 2021-25 M&E Framework',
    },
  },
  {
    value: 'ESSDP_EarlyChildhood',
    tabViewType: DASHBOARD_REPORT_TAB_VIEW,
    labelCode: 'dashboards.essdpEarlyChildhoodEducationSubSector',
  },
  {
    value: 'ESSDP_Primary',
    tabViewType: DASHBOARD_REPORT_TAB_VIEW,
    labelCode: 'dashboards.essdpPrimarySubSector',
  },
  {
    value: 'ESSDP_LowerSecondary',
    tabViewType: DASHBOARD_REPORT_TAB_VIEW,
    labelCode: 'dashboards.essdpLowerSecondarySubSector',
  },
  {
    value: 'ESSDP_UpperSecondary',
    tabViewType: DASHBOARD_REPORT_TAB_VIEW,
    labelCode: 'dashboards.essdpUpperSecondarySubSector',
  },
  {
    value: 'EmergencyInEducation',
    tabViewType: DASHBOARD_REPORT_TAB_VIEW,
    labelCode: 'dashboards.emergencyInEducation',
  },
  {
    value: 'International_SDGs',
    tabViewType: DASHBOARD_REPORT_TAB_VIEW,
    labelCode: 'dashboards.internationalReportingOnSdGs',
    exportToPDF: true,
  },
];

// Date Constants
export const SINGLE_YEAR_GRANULARITY = 'one_year_at_a_time';
export const MIN_DATA_DATE = '20150101';
export const MIN_DATA_YEAR = '2015';
// TODO: Put this back when requested
// export const DEFAULT_DATA_YEAR = `${new Date().getFullYear()}`;
export const DEFAULT_DATA_YEAR = '2022';

// Contact Constants
export const PHONE_CONTACT = '+856 20 55617710';
export const WEBSITE_CONTACT = 'www.moes.edu.la';

// Layout Constants
export const NAVBAR_HEIGHT_INT = 70;
export const NAVBAR_HEIGHT = `${NAVBAR_HEIGHT_INT}px`;
export const FOOTER_HEIGHT = '60px';

// Map Constants
export const MAPBOX_TOKEN =
  'pk.eyJ1Ijoic3Vzc29sIiwiYSI6ImNqNHMwOW02MzFhaGIycXRjMnZ1dXFlN2gifQ.1sAg5w7hYU7e3LtJM0-hSg';

export const TILE_SETS = [
  {
    key: 'osm',
    label: 'Open Streets',
    thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/osm-tile-thumbnail.png',
    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  },
  {
    key: 'satellite',
    label: 'Satellite',
    thumbnail:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/satellite-tile-thumbnail.png',
    url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
  },
];
