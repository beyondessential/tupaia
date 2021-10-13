/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const DATA_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

type ServiceName = 'entity' | 'meditrak' | 'report';
export type ServiceBaseUrlSet = Record<ServiceName, string>;

const productionSubdomains = [
  'admin',
  'admin-api',
  'config',
  'lesmis',
  'lesmis-api',
  'mobile',
  'psss',
  'psss-api',
  'report-api',
  'entity',
  'entity-api',
  'www',
  'api', // this must go last in the array, otherwise it will be detected before e.g. admin-api
];
const productionSubdomainSet = new Set(productionSubdomains);

const SERVICES = {
  entity: {
    subdomain: 'entity-api',
    version: 'v1',
    localPort: '8050',
  },
  meditrak: {
    subdomain: 'api',
    version: 'v2',
    localPort: '8090',
  },
  report: {
    subdomain: 'report-api',
    version: 'v1',
    localPort: '8030',
  },
};

const getLocalUrl = (service: ServiceName): string =>
  `http://localhost:${SERVICES[service].localPort}/${SERVICES[service].version}`;
export const LOCALHOST_BASE_URLS: ServiceBaseUrlSet = {
  entity: getLocalUrl('entity'),
  meditrak: getLocalUrl('meditrak'),
  report: getLocalUrl('report'),
};

const getServiceUrl = (service: ServiceName, subdomainPrefix?: string): string => {
  const { subdomain, version } = SERVICES[service];
  const fullSubdomain = subdomainPrefix ? `${subdomainPrefix}-${subdomain}` : subdomain;
  return `https://${fullSubdomain}.tupaia.org/${version}`;
};

export const DEV_BASE_URLS: ServiceBaseUrlSet = {
  entity: getServiceUrl('entity', 'dev'),
  meditrak: getServiceUrl('meditrak', 'dev'),
  report: getServiceUrl('report', 'dev'),
};

export const PRODUCTION_BASE_URLS: ServiceBaseUrlSet = {
  entity: getServiceUrl('entity'),
  meditrak: getServiceUrl('meditrak'),
  report: getServiceUrl('report'),
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
  hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1');

const getDefaultBaseUrls = (hostname: string): ServiceBaseUrlSet => {
  if (isLocalhost(hostname)) {
    return LOCALHOST_BASE_URLS;
  }

  // production uses standard base urls
  const [subdomain] = hostname.split('.');
  if (hostname === 'tupaia.org' || productionSubdomainSet.has(subdomain)) {
    return PRODUCTION_BASE_URLS;
  }

  // any other subdomain should prepend that same subdomain
  return {
    entity: getServiceUrlForSubdomain('entity', subdomain),
    meditrak: getServiceUrlForSubdomain('meditrak', subdomain),
    report: getServiceUrlForSubdomain('report', subdomain),
  };
};

export const getBaseUrlsForHost = (hostname: string): ServiceBaseUrlSet => {
  const { entity, meditrak, report } = getDefaultBaseUrls(hostname);
  return {
    entity: process.env.ENTITY_API_URL || entity,
    meditrak: process.env.MEDITRAK_API_URL || meditrak,
    report: process.env.REPORT_API_URL || report,
  };
};
