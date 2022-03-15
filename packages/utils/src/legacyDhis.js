/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { kebab as convertToKebabCase } from 'case';

import { getCountryNameFromCode } from './getCountryNameFromCode';

const REGIONAL_SERVER_NAME = 'regional';
const TONGA_SERVER_NAME = 'tonga';
const LAOS_DHIS_SERVER_NAME = 'lao-peoples-democratic-republic';
const PALAU_DHIS_SERVER_NAME = 'palau';
const SERVER_NAMES = new Set([
  REGIONAL_SERVER_NAME,
  TONGA_SERVER_NAME,
  LAOS_DHIS_SERVER_NAME,
  PALAU_DHIS_SERVER_NAME,
]);
const READ_ONLY_SERVERS = new Set([LAOS_DHIS_SERVER_NAME]);

const getServerUrlFromName = serverName => {
  const isProduction = process.env.IS_PRODUCTION_ENVIRONMENT === 'true';
  const urlPrefix = isProduction ? '' : process.env.AGGREGATION_URL_PREFIX;
  if (!urlPrefix && !isProduction) {
    throw new Error(
      'The environment variable AGGREGATION_URL_PREFIX is required in non-production environments. The default should be "dev-".',
    );
  }

  const dhisApiUrl = process.env[`${serverName.toUpperCase()}_DHIS_API_URL`];

  if (dhisApiUrl) {
    return dhisApiUrl;
  }

  const specificServerPrefix = '' || serverName === REGIONAL_SERVER_NAME ? '' : `${serverName}-`;
  return `https://${urlPrefix}${specificServerPrefix}aggregation.tupaia.org`;
};

const getServerNameFromCountryCode = countryCode =>
  convertToKebabCase(getCountryNameFromCode(countryCode));

const getServerName = (entityCode, isDataRegional) => {
  if (isDataRegional) return REGIONAL_SERVER_NAME;
  const countryCode = entityCode.substring(0, 2); // All entity codes start with the two letter country code
  const countrySpecificServerName = getServerNameFromCountryCode(countryCode);
  return SERVER_NAMES.has(countrySpecificServerName)
    ? countrySpecificServerName
    : REGIONAL_SERVER_NAME; // If the country does not have a dhis2 server, use the regional server
};

/**
 * @deprecated Used for migrating to new DataService based method. This file will be used for migrating data in a release,
 * after which the next release will delete this file.
 *
 * Returns configuration for creating an api instance connected to the dhis server.
 * The country containing the given entityCode will be used. If either none is passed in or the data
 * is regional, the regional dhis server will be used.
 * Can also pass the `serverName` directly, to specify exactly which instance to use.
 *
 * @param {Object}  options
 * @param {string}  options.entityCode      Along with isDataRegional, determines which dhis instance to use
 * @param {boolean} options.isDataRegional  Along with entityCode, determines which dhis instance to use
 * @param {string}  options.serverName      If provided, the server name will take this value rather
 */
export const legacy_getDhisConfig = ({
  serverName: serverNameInput,
  entityCode = '',
  entityCodes,
  isDataRegional = true,
} = {}) => {
  if (entityCodes) {
    const configs = entityCodes.map(code => legacy_getDhisConfig({ entityCode: code, isDataRegional }));
    if (configs.some(config => config.serverName !== configs[0].serverName)) {
      throw new Error('All entities must use the same DHIS2 instance');
    }
    return configs[0];
  }
  const serverName = serverNameInput || getServerName(entityCode, isDataRegional);
  const serverUrl = getServerUrlFromName(serverName);
  const serverReadOnly = READ_ONLY_SERVERS.has(serverName);

  return { serverName, serverUrl, serverReadOnly };
};
