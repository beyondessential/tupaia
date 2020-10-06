/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { QUERY_CONJUNCTIONS } from '@tupaia/database';

import { hasBESAdminAccess } from '../../permissions';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertMapOverlaysPermissions = async (accessPolicy, models, mapOverlayId) => {
  const mapOverlay = await models.mapOverlay.findById(mapOverlayId);
  if (accessPolicy.allowsSome(mapOverlay.countryCodes, mapOverlay.userGroup)) {
    return true;
  }
  throw new Error('You do not have permissions for the requested map overlay(s)');
};

export const createMapOverlayDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  const dbConditions = criteria;
  const allPermissionGroups = accessPolicy.getPermissionGroups();
  const countryCodesByPermissionGroup = {};

  // Generate lists of country codes we have access to per permission group
  allPermissionGroups.forEach(pg => {
    countryCodesByPermissionGroup[pg] = accessPolicy.getEntitiesAllowed(pg);
  });

  // Look up the json country codes by userGroup, compare them to the countryCodes from the mapOverlay
  dbConditions[RAW] = {
    sql: `"countryCodes" && array(select trim('"' from json_array_elements(?::json->"userGroup")::text))`,
    parameters: JSON.stringify(countryCodesByPermissionGroup),
  };
  return dbConditions;
};
