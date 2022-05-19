/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { keyBy, groupBy } from 'lodash';

import { hasBESAdminAccess } from '../../permissions';
import { mergeFilter } from '../utilities';
import {
  createMapOverlayDBFilter,
  hasMapOverlayGetPermissions,
  hasMapOverlayEditPermissions,
} from '../mapOverlays';

export const hasMapOverlayGroupGetPermissions = async (accessPolicy, models, mapOverlayGroupId) => {
  const mapOverlayGroup = await models.mapOverlayGroup.findById(mapOverlayGroupId);
  if (!mapOverlayGroup) {
    throw new Error(`No map overlay group exists with id "${mapOverlayGroupId}"`);
  }

  const childMapOverlayRelations = await models.mapOverlayGroupRelation.find({
    map_overlay_group_id: mapOverlayGroupId,
  });

  if (childMapOverlayRelations.length === 0) {
    return true;
  }

  const childMapOverlayRelationsByType = groupBy(childMapOverlayRelations, 'child_type');
  const mapOverlayRelations =
    childMapOverlayRelationsByType[models.mapOverlayGroupRelation.RelationChildTypes.MAP_OVERLAY];
  const mapOverlayGroupRelations =
    childMapOverlayRelationsByType[
      models.mapOverlayGroupRelation.RelationChildTypes.MAP_OVERLAY_GROUP
    ];

  for (const mapOverlayRelation of mapOverlayRelations) {
    const result = await hasMapOverlayGetPermissions(
      accessPolicy,
      models,
      mapOverlayRelation.child_id,
    );
    if (result.result) {
      return result;
    }
  }

  for (const mapOverlayGroupRelation of mapOverlayGroupRelations) {
    const result = await hasMapOverlayGroupGetPermissions(
      accessPolicy,
      models,
      mapOverlayGroupRelation.child_id,
    );
    if (result.result) {
      return result;
    }
  }

  return {
    result: false,
    errorMessage: `Requires access to at least one child item of map overlay group with id "${mapOverlayGroupId}"`,
  };
};

export const hasMapOverlayGroupEditPermissions = async (
  accessPolicy,
  models,
  mapOverlayGroupId,
) => {
  const mapOverlayGroup = await models.mapOverlayGroup.findById(mapOverlayGroupId);
  if (!mapOverlayGroup) {
    return {
      result: false,
      errorMessage: `No map overlay group exists with id "${mapOverlayGroupId}"`,
    };
  }

  const childMapOverlayRelations = await models.mapOverlayGroupRelation.find({
    map_overlay_group_id: mapOverlayGroupId,
  });

  if (childMapOverlayRelations.length === 0) {
    return true;
  }

  const childMapOverlayRelationsByType = groupBy(childMapOverlayRelations, 'child_type');
  const mapOverlayRelations =
    childMapOverlayRelationsByType[models.mapOverlayGroupRelation.RelationChildTypes.MAP_OVERLAY];
  const mapOverlayGroupRelations =
    childMapOverlayRelationsByType[
      models.mapOverlayGroupRelation.RelationChildTypes.MAP_OVERLAY_GROUP
    ];

  for (const mapOverlayRelation of mapOverlayRelations) {
    const result = await hasMapOverlayEditPermissions(
      accessPolicy,
      models,
      mapOverlayRelation.child_id,
    );
    if (!result.result) {
      return result;
    }
  }

  for (const mapOverlayGroupRelation of mapOverlayGroupRelations) {
    const result = await hasMapOverlayGroupEditPermissions(
      accessPolicy,
      models,
      mapOverlayGroupRelation.child_id,
    );
    if (!result.result) {
      return result;
    }
  }

  return {
    result: true,
  };
};

export const assertMapOverlayGroupsGetPermissions = async (
  accessPolicy,
  models,
  mapOverlayGroupId,
) => {
  const result = await hasMapOverlayGroupGetPermissions(accessPolicy, models, mapOverlayGroupId);
  if (result.result) {
    return true;
  }

  throw new Error(result.errorMessage);
};

export const assertMapOverlayGroupsEditPermissions = async (accessPolicy, models, mapOverlayId) => {
  const result = await hasMapOverlayGroupEditPermissions(accessPolicy, models, mapOverlayId);

  if (result.result) {
    return true;
  }

  throw new Error(result.errorMessage);
};

/**
 * We can have multi level map overlay groups. So to find all the permitted map overlay groups,
 * we have to traverse from the bottom map overlay group relations (that have map overlays as childrens) until
 * we hit the root map overlay group (top) to also include any nested map overlay groups.
 */
const findPermittedMapOverlayGroupIds = (
  relationByChildId,
  permittedMapOverlayGroupRelations,
  rootMapOverlayGroupId,
) => {
  const permittedMapOverlayGroupIds = [];

  permittedMapOverlayGroupRelations.forEach(r => {
    if (r.map_overlay_group_id === rootMapOverlayGroupId) {
      return;
    }

    permittedMapOverlayGroupIds.push(r.map_overlay_group_id);
  });

  if (permittedMapOverlayGroupRelations.length === 0) {
    return [];
  }

  const newRelations = permittedMapOverlayGroupIds
    .map(id => relationByChildId[id])
    .filter(r => !!r);

  const nextPermittedMapOverlayGroupIds = findPermittedMapOverlayGroupIds(
    relationByChildId,
    newRelations,
  );

  return [...permittedMapOverlayGroupIds, ...nextPermittedMapOverlayGroupIds];
};

export const createMapOverlayGroupDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }

  const dbConditions = { ...criteria };

  const allMapOverlayGroupRelations = await models.mapOverlayGroupRelation.find();
  const relationByChildId = keyBy(allMapOverlayGroupRelations, 'child_id');

  // Pull the list of map overlays we have access to,
  // then pull the corresponding map overlay groups
  const mapOverlaysFilter = createMapOverlayDBFilter(accessPolicy);
  const permittedMapOverlays = await models.mapOverlay.find(mapOverlaysFilter);
  const permittedMapOverlayGroupRelations = await models.mapOverlayGroupRelation.find({
    child_id: permittedMapOverlays.map(mo => mo.id),
    child_type: 'mapOverlay',
  });
  const rootMapOverlayGroup = await models.mapOverlayGroup.findRootMapOverlayGroup();
  const permittedMapOverlayGroupIds = findPermittedMapOverlayGroupIds(
    relationByChildId,
    permittedMapOverlayGroupRelations,
    rootMapOverlayGroup.id,
  );

  dbConditions['map_overlay_group.id'] = mergeFilter(
    permittedMapOverlayGroupIds,
    dbConditions['map_overlay_group.id'],
  );

  return dbConditions;
};
