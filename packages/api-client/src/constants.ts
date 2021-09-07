/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const DATA_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

type ServiceName = 'entity' | 'meditrak' | 'report';
export type ServiceBaseUrlSet = Record<ServiceName, string>;

const productionSubdomains = new Set([
  'admin',
  'admin-api',
  'api',
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
]);

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

const getProductionUrl = (service: ServiceName): string =>
  `https://${SERVICES[service].subdomain}.tupaia.org/${SERVICES[service].version}`;
export const PRODUCTION_BASE_URLS: ServiceBaseUrlSet = {
  entity: getProductionUrl('entity'),
  meditrak: getProductionUrl('meditrak'),
  report: getProductionUrl('report'),
};

const getServiceUrlForSubdomain = (service: ServiceName, subdomain: string): string => {
  const { subdomain: baseSubdomain, version } = SERVICES[service];
  const subdomainPrefix = subdomain.split('-')[0]; // todo do this properly
  return `https://${subdomainPrefix}-${baseSubdomain}.tupaia.org/${version}`;
};

const getDefaultBaseUrls = (hostname: string): ServiceBaseUrlSet => {
  if (hostname.startsWith('localhost')) {
    return LOCALHOST_BASE_URLS;
  }

  // production uses standard base urls
  const [subdomain] = hostname.split('.');
  if (hostname === 'tupaia.org' || productionSubdomains.has(subdomain)) {
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
