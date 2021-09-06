/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const DATA_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export type EndpointBaseUrlSet = {
  entity: string;
  meditrak: string;
  report: string;
}

export const LOCALHOST_ENDPOINT_BASE_URLS: EndpointBaseUrlSet = {
  'entity': 'http://localhost:8050/v1',
  'meditrak': 'http://localhost:8090/v2',
  'report': 'http://localhost:x/y',
}

export const DEV_BASE_URLS: EndpointBaseUrlSet = {
  'entity': 'https://dev-entity-api.tupaia.org/v1',
  'meditrak': 'https://dev-api.tupaia.org/v2',
  'report': 'https://dev-report-api.tupaia.org/v1',
}

export const ENDPOINT_BASE_URLS: EndpointBaseUrlSet = {
  'entity': 'https://entity-api.tupaia.org/v1',
  'meditrak': 'https://api.tupaia.org/v2',
  'report': 'https://report-api.tupaia.org/v1',
}