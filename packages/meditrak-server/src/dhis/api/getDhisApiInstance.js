/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { getName } from 'countrynames';
import { kebab as convertToKebabCase, capital as capitaliseFirstLetters } from 'case';
import { DhisApi, REGIONAL_SERVER_NAME } from './DhisApi';

const dhisApiInstances = {};

/**
 * Returns an api instance connected to the dhis server for the country containing the given
 * organisationUnitCode, or the regional dhis server if either none is passed in, or the data
 * is regional
 */
export const getDhisApiInstanceForChange = ({ details }) => {
  const { isDataRegional, organisationUnitCode } = details;
  let serverName = REGIONAL_SERVER_NAME;
  if (!isDataRegional && organisationUnitCode) {
    const countryCode = organisationUnitCode.substring(0, 2); // All organisation unit codes start with the two letter country code
    serverName = getServerNameFromCountryCode(countryCode);
  }
  return getDhisApiInstance(serverName);
};

export const getDhisApiInstance = (serverName = REGIONAL_SERVER_NAME) => {
  if (!dhisApiInstances[serverName]) {
    dhisApiInstances[serverName] = new DhisApi(serverName);
  }
  return dhisApiInstances[serverName];
};

const getServerNameFromCountryCode = countryCode =>
  convertToKebabCase(getCountryNameFromCode(countryCode));

const getCountryNameFromCode = countryCode => {
  if (countryCode === 'DL') {
    return 'Demo Land';
  }
  return capitaliseFirstLetters(getName(countryCode));
};
