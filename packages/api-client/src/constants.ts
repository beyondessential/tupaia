import { getEnvVarOrDefault } from '@tupaia/utils';

export const DATA_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

type ServiceName = 'auth' | 'entity' | 'central' | 'report' | 'dataTable' | 'webConfig' | 'sync';
export type ServiceBaseUrlSet = Record<ServiceName, string>;

const productionSubdomains = [
  'admin',
  'admin-api',
  'config',
  'lesmis',
  'lesmis-api',
  'mobile',
  'meditrak-api',
  'psss',
  'psss-api',
  'report-api',
  'sync-api',
  'entity-api',
  'data-table-api',
  'www',
  'api', // this must go last in the array, otherwise it will be detected before e.g. admin-api
];
const productionSubdomainSet = new Set(productionSubdomains);

const SERVICES = {
  auth: {
    subdomain: 'api',
    version: 'v2',
    localPort: '8090',
    prefix: null,
  },
  entity: {
    subdomain: 'entity-api',
    version: 'v1',
    localPort: '8050',
    prefix: null,
  },
  central: {
    subdomain: 'api',
    version: 'v2',
    localPort: '8090',
    prefix: null,
  },
  report: {
    subdomain: 'report-api',
    version: 'v1',
    localPort: '8030',
    prefix: null,
  },
  dataTable: {
    subdomain: 'data-table-api',
    version: 'v1',
    localPort: '8010',
    prefix: null,
  },
  webConfig: {
    subdomain: 'config',
    prefix: 'api',
    version: 'v1',
    localPort: '8000',
  },
  sync: {
    subdomain: 'sync-api',
    version: 'v1',
    localPort: '8120',
    prefix: null,
  },
};

const getLocalUrl = (service: ServiceName): string => {
  const { prefix, localPort, version } = SERVICES[service];
  const base = `http://localhost:${localPort}`;
  const prefixPath = prefix ? `/${prefix}` : '';
  return `${base}${prefixPath}/${version}`;
};

export const LOCALHOST_BASE_URLS: ServiceBaseUrlSet = {
  auth: getLocalUrl('auth'),
  entity: getLocalUrl('entity'),
  central: getLocalUrl('central'),
  report: getLocalUrl('report'),
  dataTable: getLocalUrl('dataTable'),
  webConfig: getLocalUrl('webConfig'),
  sync: getLocalUrl('sync'),
};

const getServiceUrl = (service: ServiceName, subdomainPrefix?: string): string => {
  const DOMAIN = getEnvVarOrDefault('DOMAIN', 'tupaia.org');
  const { subdomain, version } = SERVICES[service];
  const fullSubdomain = subdomainPrefix ? `${subdomainPrefix}-${subdomain}` : subdomain;
  return `https://${fullSubdomain}.${DOMAIN}/${version}`;
};

export const DEV_BASE_URLS: ServiceBaseUrlSet = {
  auth: getServiceUrl('auth', 'dev'),
  entity: getServiceUrl('entity', 'dev'),
  central: getServiceUrl('central', 'dev'),
  report: getServiceUrl('report', 'dev'),
  dataTable: getServiceUrl('dataTable', 'dev'),
  webConfig: getServiceUrl('webConfig', 'dev'),
  sync: getServiceUrl('sync', 'dev'),
};

export const PRODUCTION_BASE_URLS: ServiceBaseUrlSet = {
  auth: getServiceUrl('auth'),
  entity: getServiceUrl('entity'),
  central: getServiceUrl('central'),
  report: getServiceUrl('report'),
  dataTable: getServiceUrl('dataTable'),
  webConfig: getServiceUrl('webConfig'),
  sync: getServiceUrl('sync'),
};

const getServiceUrlForSubdomain = (service: ServiceName, originalSubdomain: string): string => {
  const productionSubdomain = productionSubdomains.find(subdomain =>
    originalSubdomain.endsWith(subdomain),
  );
  if (!productionSubdomain) {
    throw new Error('No subdomain matched');
  }
  // cut the production subdomain component off the end, e.g. nz-917-admin-api -> nz-917
  const subdomainPrefix = originalSubdomain.substring(
    0,
    originalSubdomain.length - productionSubdomain.length - 1, // remove trailing '-' as well
  );
  return getServiceUrl(service, subdomainPrefix);
};

const isLocalhost = (hostname: string) =>
  hostname.startsWith('localhost') ||
  hostname.startsWith('127.0.0.1') ||
  hostname.startsWith('10.0.2.2'); // Android Emulator out to host

export const getDefaultBaseUrls = (hostname: string): ServiceBaseUrlSet => {
  const DOMAIN = getEnvVarOrDefault('DOMAIN', 'tupaia.org');
  if (isLocalhost(hostname)) {
    return LOCALHOST_BASE_URLS;
  }

  // production uses standard base urls
  const [subdomain] = hostname.split('.');
  if (hostname === DOMAIN || productionSubdomainSet.has(subdomain)) {
    return PRODUCTION_BASE_URLS;
  }

  // any other subdomain should prepend that same subdomain
  return {
    auth: getServiceUrlForSubdomain('auth', subdomain),
    entity: getServiceUrlForSubdomain('entity', subdomain),
    central: getServiceUrlForSubdomain('central', subdomain),
    report: getServiceUrlForSubdomain('report', subdomain),
    dataTable: getServiceUrlForSubdomain('dataTable', subdomain),
    webConfig: getServiceUrlForSubdomain('webConfig', subdomain), 
    sync: getServiceUrlForSubdomain('sync', subdomain),
  };
};

export const getBaseUrlsForHost = (hostname: string): ServiceBaseUrlSet => {
  const { auth, entity, central, report, dataTable, webConfig, sync } = getDefaultBaseUrls(hostname);
  return {
    auth: process.env.AUTH_API_URL || auth,
    entity: process.env.ENTITY_API_URL || entity,
    central: process.env.CENTRAL_API_URL || central,
    report: process.env.REPORT_API_URL || report,
    dataTable: process.env.DATA_TABLE_API_URL || dataTable,
    webConfig: process.env.WEB_CONFIG_API_URL || webConfig,
    sync: process.env.SYNC_API_URL || sync,
  };
};
