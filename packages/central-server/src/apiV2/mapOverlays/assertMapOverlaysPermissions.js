/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import {
  hasAccessToEntityForVisualisation,
  hasVizBuilderAccessToEntityForVisualisation,
} from '../utilities';
const { RAW } = QUERY_CONJUNCTIONS;

export const hasMapOverlayGetPermissions = async (accessPolicy, models, mapOverlayId) => {
  const mapOverlay = await models.mapOverlay.findById(mapOverlayId);
  if (!mapOverlay) {
    return {
      result: false,
      errorMessage: `No map overlay exists with id "${mapOverlayId}"`,
    };
  }

  const entities = await models.entity.find({ code: mapOverlay.country_codes });
  for (let i = 0; i < entities.length; i++) {
    if (
      await hasAccessToEntityForVisualisation(
        accessPolicy,
        models,
        entities[i],
        mapOverlay.permission_group,
      )
    ) {
      return {
        result: true,
      };
    }
  }

  return {
    result: false,
    errorMessage: `Requires "${
      mapOverlay.permission_group
    }" access to all countries "${mapOverlay.country_codes.toString()}" of the map overlay`,
  };
};

export const hasMapOverlayEditPermissions = async (accessPolicy, models, mapOverlayId) => {
  const mapOverlay = await models.mapOverlay.findById(mapOverlayId);
  if (!mapOverlay) {
    return {
      result: false,
      errorMessage: `No map overlay exists with id ${mapOverlayId}`,
    };
  }

  const entities = await models.entity.find({ code: mapOverlay.country_codes });

  // Check we have permission group access to all countries the mapOverlay is in
  const hasPermissionGroupAccess = (
    await Promise.all(
      entities.map(entity =>
        hasVizBuilderAccessToEntityForVisualisation(
          accessPolicy,
          models,
          entity,
          mapOverlay.permission_group,
        ),
      ),
    )
  ).every(access => access);

  return hasPermissionGroupAccess
    ? { result: true }
    : {
        result: false,
        errorMessage: `Cannot edit map overlay "${mapOverlayId}" as you do not have permission group access to all of its countries (${mapOverlay.country_codes})`,
      };
};

export const assertMapOverlaysGetPermissions = async (accessPolicy, models, mapOverlayId) => {
  const result = await hasMapOverlayGetPermissions(accessPolicy, models, mapOverlayId);
  if (result.result) {
    return true;
  }

  throw new Error(result.errorMessage);
};

export const assertMapOverlaysEditPermissions = async (accessPolicy, models, mapOverlayId) => {
  const result = await hasMapOverlayEditPermissions(accessPolicy, models, mapOverlayId);
  if (result.result) {
    return true;
  }

  throw new Error(result.errorMessage);
};

export const createMapOverlayDBFilter = (accessPolicy, criteria) => {
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
      -- Special case for no permission
      (
        "map_overlay"."permission_group" = ''
      )
      -- Look up the country codes list from the map overlay and check that the user has
      -- access to at least one of the countries for the appropriate permissions group
      OR (
        "map_overlay"."country_codes"
        &&
        ARRAY(
          SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->"map_overlay"."permission_group")::TEXT)
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
            WHERE ARRAY[project.code] <@ "map_overlay"."country_codes"
        )::TEXT[]
        &&
        ARRAY(
          SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->"map_overlay"."permission_group")::TEXT)
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
