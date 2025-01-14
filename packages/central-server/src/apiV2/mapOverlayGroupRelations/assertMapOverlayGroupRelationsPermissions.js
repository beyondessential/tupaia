import { hasBESAdminAccess } from '../../permissions';
import { mergeFilter } from '../utilities';
import { hasMapOverlayGetPermissions, hasMapOverlayEditPermissions } from '../mapOverlays';
import {
  hasMapOverlayGroupGetPermissions,
  hasMapOverlayGroupEditPermissions,
  getPermittedMapOverlayGroupIds,
} from '../mapOverlayGroups';

export const hasMapOverlayGroupRelationGetPermissions = async (
  accessPolicy,
  models,
  mapOverlayGroupRelationId,
) => {
  const mapOverlayGroupRelation = await models.mapOverlayGroupRelation.findById(
    mapOverlayGroupRelationId,
  );
  if (!mapOverlayGroupRelation) {
    throw new Error(`No map overlay group relation exists with id ${mapOverlayGroupRelation}`);
  }

  if (
    mapOverlayGroupRelation.child_type ===
    models.mapOverlayGroupRelation.RelationChildTypes.MAP_OVERLAY
  ) {
    return hasMapOverlayGetPermissions(accessPolicy, models, mapOverlayGroupRelation.child_id);
  }

  if (
    mapOverlayGroupRelation.child_type ===
    models.mapOverlayGroupRelation.RelationChildTypes.MAP_OVERLAY_GROUP
  ) {
    return hasMapOverlayGroupGetPermissions(accessPolicy, models, mapOverlayGroupRelation.child_id);
  }

  return {
    result: false,
    errorMessage: `Invalid child_type ${mapOverlayGroupRelation.child_type}`,
  };
};

export const hasMapOverlayGroupRelationEditPermissions = async (
  accessPolicy,
  models,
  mapOverlayGroupRelationId,
) => {
  const mapOverlayGroupRelation = await models.mapOverlayGroupRelation.findById(
    mapOverlayGroupRelationId,
  );
  if (!mapOverlayGroupRelation) {
    throw new Error(`No map overlay group relation exists with id ${mapOverlayGroupRelation}`);
  }

  if (
    mapOverlayGroupRelation.child_type ===
    models.mapOverlayGroupRelation.RelationChildTypes.MAP_OVERLAY
  ) {
    return hasMapOverlayEditPermissions(accessPolicy, models, mapOverlayGroupRelation.child_id);
  }

  if (
    mapOverlayGroupRelation.child_type ===
    models.mapOverlayGroupRelation.RelationChildTypes.MAP_OVERLAY_GROUP
  ) {
    return hasMapOverlayGroupEditPermissions(
      accessPolicy,
      models,
      mapOverlayGroupRelation.child_id,
    );
  }

  return {
    result: false,
    errorMessage: `Invalid child_type ${mapOverlayGroupRelation.child_type}`,
  };
};

export const assertMapOverlayGroupRelationsGetPermissions = async (
  accessPolicy,
  models,
  mapOverlayGroupRelationId,
) => {
  const result = await hasMapOverlayGroupRelationGetPermissions(
    accessPolicy,
    models,
    mapOverlayGroupRelationId,
  );
  if (result.result) {
    return true;
  }

  throw new Error(result.errorMessage);
};

export const assertMapOverlayGroupRelationsEditPermissions = async (
  accessPolicy,
  models,
  mapOverlayId,
) => {
  const result = await hasMapOverlayGroupRelationEditPermissions(
    accessPolicy,
    models,
    mapOverlayId,
  );
  if (result.result) {
    return true;
  }

  throw new Error(result.errorMessage);
};

export const createMapOverlayGroupRelationDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }

  const dbConditions = { ...criteria };

  // Pull the list of map overlays we have access to,
  // then pull the corresponding map overlay groups
  const permittedMapOverlayGroupIds = await getPermittedMapOverlayGroupIds(accessPolicy, models);
  const permittedMapOverlayGroups = await models.mapOverlayGroup.find({
    id: permittedMapOverlayGroupIds,
  });

  // Ensure filter is not a string
  const filterToMerge =
    typeof dbConditions['map_overlay_group_relation.map_overlay_group_id'] === 'string'
      ? [dbConditions['map_overlay_group_relation.map_overlay_group_id']]
      : dbConditions['map_overlay_group_relation.map_overlay_group_id'];

  dbConditions['map_overlay_group_relation.map_overlay_group_id'] = mergeFilter(
    permittedMapOverlayGroups.map(mog => mog.id),
    filterToMerge,
  );

  return dbConditions;
};

export const createRelationsViaParentOverlayGroupDBFilter = async (
  accessPolicy,
  models,
  criteria,
  mapOverlayGroupId,
) => {
  const dbConditions = { ...criteria };

  const relations = await models.mapOverlayGroupRelation.find({
    map_overlay_group_id: mapOverlayGroupId,
  });

  const permittedRelationIds = [];
  for (const relation of relations) {
    const result = await hasMapOverlayGroupRelationGetPermissions(
      accessPolicy,
      models,
      relation.id,
    );
    if (result.result) {
      permittedRelationIds.push(relation.id);
    }
  }

  dbConditions['map_overlay_group_relation.id'] = mergeFilter(
    permittedRelationIds,
    dbConditions['map_overlay_group_relation.id'],
  );

  return dbConditions;
};

export const createRelationsViaParentMapOverlayDBFilter = async (
  accessPolicy,
  models,
  criteria,
  mapOverlayId,
) => {
  const dbConditions = { ...criteria };

  const relations = await models.mapOverlayGroupRelation.find({
    child_id: mapOverlayId,
  });

  const permittedRelationIds = [];
  for (const relation of relations) {
    const result = await hasMapOverlayGroupRelationGetPermissions(
      accessPolicy,
      models,
      relation.id,
    );
    if (result.result) {
      permittedRelationIds.push(relation.id);
    }
  }

  dbConditions['map_overlay_group_relation.id'] = mergeFilter(
    permittedRelationIds,
    dbConditions['map_overlay_group_relation.id'],
  );

  return dbConditions;
};
