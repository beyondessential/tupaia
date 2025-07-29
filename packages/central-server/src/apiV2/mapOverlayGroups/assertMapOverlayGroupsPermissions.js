import { keyBy, groupBy } from 'es-toolkit/compat';
import { JOIN_TYPES, QUERY_CONJUNCTIONS, RECORDS } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import {
  createMapOverlayDBFilter,
  hasMapOverlayGetPermissions,
  hasMapOverlayEditPermissions,
} from '../mapOverlays';
import { mergeFilter } from '../utilities';

export const hasMapOverlayGroupGetPermissions = async (accessPolicy, models, mapOverlayGroupId) => {
  const mapOverlayGroup = await models.mapOverlayGroup.findById(mapOverlayGroupId);
  if (!mapOverlayGroup) {
    throw new Error(`No map overlay group exists with id "${mapOverlayGroupId}"`);
  }

  const childMapOverlayRelations = await models.mapOverlayGroupRelation.find({
    map_overlay_group_id: mapOverlayGroupId,
  });

  if (childMapOverlayRelations.length === 0) {
    return {
      result: true,
    };
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
    return {
      result: true,
    };
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
  if (mapOverlayGroupRelations) {
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
 * we have to traverse from the bottom map overlay group relations (that have map overlays as children) until
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

const getMapOverlayGroupsWithNoRelation = async models => {
  const rootMapOverlayGroup = await models.mapOverlayGroup.findRootMapOverlayGroup();

  const noRelationFilter = {
    'map_overlay_group_relation.child_id': {
      comparator: 'IS',
      comparisonValue: null,
    },
    [QUERY_CONJUNCTIONS.AND]: {
      'map_overlay_group.id': {
        comparator: '!=',
        comparisonValue: rootMapOverlayGroup.id,
      },
    },
  };

  return models.mapOverlayGroup.find(noRelationFilter, {
    joinWith: RECORDS.MAP_OVERLAY_GROUP_RELATION,
    joinType: JOIN_TYPES.LEFT,
    joinCondition: [
      `${RECORDS.MAP_OVERLAY_GROUP}.id`,
      `${RECORDS.MAP_OVERLAY_GROUP_RELATION}.map_overlay_group_id`,
    ],
  });
};

export const getPermittedMapOverlayGroupIds = async (accessPolicy, models) => {
  const allMapOverlayGroupRelations = await models.mapOverlayGroupRelation.find();
  const relationByChildId = keyBy(allMapOverlayGroupRelations, 'child_id');

  const mapOverlayGroupsWithNoRelation = await getMapOverlayGroupsWithNoRelation(models);

  // Pull the list of map overlays we have access to
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
  return [
    ...new Set([...permittedMapOverlayGroupIds, ...mapOverlayGroupsWithNoRelation.map(m => m.id)]),
  ];
};

export const createMapOverlayGroupDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }

  const dbConditions = { ...criteria };

  const permittedMapOverlayGroupIds = await getPermittedMapOverlayGroupIds(accessPolicy, models);

  if (permittedMapOverlayGroupIds.length === 0) {
    // if no permitted map overlay groups, make a condition that will return no results
    return {
      ...dbConditions,
      'map_overlay_group.id': {
        comparator: 'IS',
        comparisonValue: null,
      },
    };
  }

  // Apply a filter to only show map overlay groups that have a relation to a map overlay we have access to, or have no relation at all. Any further id filtering will still be applied.

  dbConditions['map_overlay_group.id'] = mergeFilter(
    {
      comparator: 'IN',
      comparisonValue: permittedMapOverlayGroupIds,
    },
    // this needs to go last in case it is undefined, so the mergeFilter function can handle it
    dbConditions['map_overlay_group.id'],
  );

  return dbConditions;
};
