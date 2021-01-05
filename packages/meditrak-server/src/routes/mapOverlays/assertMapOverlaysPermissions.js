/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import {
  hasAccessToEntityForVisualisation,
  hasTupaiaAdminAccessToEntityForVisualisation,
} from '../utilities';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertMapOverlaysGetPermissions = async (accessPolicy, models, mapOverlayId) => {
  const mapOverlay = await models.mapOverlay.findById(mapOverlayId);
  if (!mapOverlay) {
    throw new Error(`No map overlay exists with id ${mapOverlayId}`);
  }

  const entities = await models.entity.find({ code: mapOverlay.countryCodes });
  for (let i = 0; i < entities.length; i++) {
    if (
      await hasAccessToEntityForVisualisation(
        accessPolicy,
        models,
        entities[i],
        mapOverlay.userGroup,
      )
    ) {
      return true;
    }
  }

  throw new Error('You do not have permissions for the requested map overlay(s)');
};

export const assertMapOverlaysEditPermissions = async (accessPolicy, models, mapOverlayId) => {
  const mapOverlay = await models.mapOverlay.findById(mapOverlayId);
  if (!mapOverlay) {
    throw new Error(`No map overlay exists with id ${mapOverlayId}`);
  }

  const entities = await models.entity.find({ code: mapOverlay.countryCodes });
  let hasUserGroupAccess = false;

  // Check we have tupaia admin access to all countries the mapOverlay is in
  // And user group access to at least one of the countries
  for (let i = 0; i < entities.length; i++) {
    if (!(await hasTupaiaAdminAccessToEntityForVisualisation(accessPolicy, models, entities[i]))) {
      throw new Error('Requires tupaia admin panel access to all countries for the map overlay');
    }
    if (
      !hasUserGroupAccess &&
      (await hasAccessToEntityForVisualisation(
        accessPolicy,
        models,
        entities[i],
        mapOverlay.userGroup,
      ))
    ) {
      hasUserGroupAccess = true;
    }
  }

  if (!hasUserGroupAccess) {
    throw new Error(
      'Cannot edit a map overlay you do not have user group access to in at least one country',
    );
  }

  return true;
};

export const createMapOverlayDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  const dbConditions = { ...criteria };
  const allPermissionGroups = accessPolicy.getPermissionGroups();
  const countryCodesByPermissionGroup = {};

  // Generate lists of country codes we have access to per permission group
  allPermissionGroups.forEach(pg => {
    countryCodesByPermissionGroup[pg] = accessPolicy.getEntitiesAllowed(pg);
  });

  dbConditions[RAW] = {
    sql: `
    (
      -- Look up the country codes list from the map overlay and check that the user has
      -- access to at least one of the countries for the appropriate permissions group
      (
        "mapOverlay"."countryCodes"
        &&
        ARRAY(
          SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->"mapOverlay"."userGroup")::TEXT)
        )
      )
      -- For project level overlays, pull the country codes from the child entities and check that there is
      -- overlap with the user's list of countries for the appropriate permission group (i.e., they have
      -- access to at least one country within the project)
      OR (
        ARRAY(
          SELECT entity.country_code
            FROM entity
            INNER JOIN entity_relation
              ON entity.id = entity_relation.child_id
            INNER JOIN project
              ON  entity_relation.parent_id = project.entity_id
              AND entity_relation.entity_hierarchy_id = project.entity_hierarchy_id
            WHERE ARRAY[project.code] <@ "mapOverlay"."countryCodes"
        )::TEXT[]
        &&
        ARRAY(
          SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->"mapOverlay"."userGroup")::TEXT)
        )
      )
    )`,
    parameters: [
      JSON.stringify(countryCodesByPermissionGroup),
      JSON.stringify(countryCodesByPermissionGroup),
    ],
  };
  return dbConditions;
};
