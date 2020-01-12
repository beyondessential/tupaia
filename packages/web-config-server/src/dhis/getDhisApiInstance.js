/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import { kebab as convertToKebabCase } from 'case';
import { DhisApi, REGIONAL_SERVER_NAME } from '@tupaia/dhis-api';
import { getCountryNameFromCode } from '/utils';

const SUPPORTED_SERVERS = new Set([REGIONAL_SERVER_NAME, 'tonga']);

const dhisApiInstances = {};

/**
 * Returns an api instance connected to the dhis server for the country containing the given
 * organisationUnitCode, or the regional dhis server if either none is passed in, or the data
 * is regional
 * @param {*} organisationUnitCode
 * @param {*} isDataRegional
 */
export const getDhisApiInstance = (organisationUnitCode = '', isDataRegional = true) => {
  const countryCode = organisationUnitCode.substring(0, 2); // All organisation unit codes start with the two letter country code
  const countrySpecificServerName = getServerNameFromCountryCode(countryCode);
  const serverName =
    isDataRegional || !SUPPORTED_SERVERS.has(countrySpecificServerName)
      ? // If the country does not have a dhis2 server, or this is data stored regionally, use the regional server
        REGIONAL_SERVER_NAME
      : countrySpecificServerName;
  if (!dhisApiInstances[serverName]) {
    dhisApiInstances[serverName] = new DhisApi(serverName);
  }
  return dhisApiInstances[serverName];
};

const getServerNameFromCountryCode = countryCode =>
  convertToKebabCase(getCountryNameFromCode(countryCode));
