export const DATA_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export type EndpointBaseUrlSet = {
  admin: string;
  config: string;
  entity: string;
  lesmis: string;
  meditrak: string;
  psss: string;
  report: string;
}

export const LOCALHOST_ENDPOINT_BASE_URLS: EndpointBaseUrlSet = {
  'admin': 'http://localhost:8090/v2',
  'config': 'http://localhost:8000/api/v1',
  'entity': 'http://localhost:8050/v1',
  'lesmis': 'http://localhost:x/y',
  'meditrak': 'http://localhost:8090/v2',
  'psss': 'http://localhost:9998/v1',
  'report': 'http://localhost:x/y',
}

export const ENDPOINT_BASE_URLS: EndpointBaseUrlSet = {
  'admin': 'https://admin-api.tupaia.org/v1',
  'config': 'https://config.tupaia.org/v1',
  'entity': 'https://entity-api.tupaia.org/v1',
  'lesmis': 'https://lesmis-api.tupaia.org/v1',
  'meditrak': 'https://api.tupaia.org/v2',
  'psss': 'https://psss-api.tupaia.org/v1',
  'report': 'https://report-api.tupaia.org/v1',
}