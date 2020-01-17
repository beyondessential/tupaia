/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import { kebab as convertToKebabCase } from 'case';
import { DhisApi } from '@tupaia/dhis-api';
import { getCountryNameFromCode } from '@tupaia/utils';

const REGIONAL_SERVER_NAME = 'regional';
const SUPPORTED_SERVERS = new Set([REGIONAL_SERVER_NAME, 'tonga']);

const dhisApiInstances = {};

const getServerUrlFromName = serverName => {
  const isProduction = process.env.IS_PRODUCTION_ENVIRONMENT === 'true';
  const devPrefix = isProduction ? '' : 'dev-';
  const specificServerPrefix = '' || serverName === REGIONAL_SERVER_NAME ? '' : `${serverName}-`;
  return `https://${devPrefix}${specificServerPrefix}aggregation.tupaia.org`;
};

const getServerNameFromCountryCode = countryCode =>
  convertToKebabCase(getCountryNameFromCode(countryCode));

const getServerName = (entityCode, isDataRegional) => {
  if (isDataRegional) return REGIONAL_SERVER_NAME;
  const countryCode = entityCode.substring(0, 2); // All organisation unit codes start with the two letter country code
  const countrySpecificServerName = getServerNameFromCountryCode(countryCode);
  return SUPPORTED_SERVERS.has(countrySpecificServerName)
    ? countrySpecificServerName
    : REGIONAL_SERVER_NAME; // If the country does not have a dhis2 server, use the regional server
};

/**
 * Returns an api instance connected to the dhis server for the country containing the given
 * entityCode, or the regional dhis server if either none is passed in, or the data
 * is regional
 * @param {*} entityCode
 * @param {*} isDataRegional
 */
export const getDhisApiInstance = ({
  serverName: providedServerName,
  entityCode = '',
  isDataRegional = true,
}) => {
  const serverName = providedServerName || getServerName(entityCode, isDataRegional);
  if (!dhisApiInstances[serverName]) {
    dhisApiInstances[serverName] = new DhisApi(serverName, getServerUrlFromName(serverName));
  }
  return dhisApiInstances[serverName];
};
