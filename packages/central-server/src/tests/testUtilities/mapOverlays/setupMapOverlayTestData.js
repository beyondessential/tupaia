import { findOrCreateDummyRecord } from '@tupaia/database';

export const findOrCreateMapOverlay = async (models, id, countryCode) => {
  // Set up the map overlays
  return findOrCreateDummyRecord(
    models.mapOverlay,
    { id },
    {
      name: id,
      permission_group: 'Admin',
      country_codes: [countryCode],
    },
  );
};

export const findOrCreateMapOverlayGroup = async (models, id) => {
  // Set up the map overlays
  return findOrCreateDummyRecord(
    models.mapOverlayGroup,
    { id },
    {
      name: id,
      code: id,
    },
  );
};

export const findOrCreateMapOverlayGroupRelation = async (
  models,
  overlayId,
  groupId,
  childType,
) => {
  // Set up the map overlays
  return findOrCreateDummyRecord(
    models.mapOverlayGroupRelation,
    { id: `${overlayId}|${groupId}` },
    {
      map_overlay_group_id: groupId,
      child_id: overlayId,
      child_type: childType,
    },
  );
};

export const setupMapOverlayTestData = async models => {
  // Set up the map overlays
  const nationalMapOverlay1 = await findOrCreateMapOverlay(
    models,
    'national_map_overlay_1_test',
    'KI',
  );
  const nationalMapOverlay2 = await findOrCreateMapOverlay(
    models,
    'national_map_overlay_2_test',
    'LA',
  );
  const projectLevelMapOverlay1 = await findOrCreateMapOverlay(
    models,
    'project_level_map_overlay_3_test',
    'test_project',
  );

  // Create root map overlay group
  await findOrCreateMapOverlayGroup(models, models.mapOverlayGroup.RootMapOverlayGroupCode);

  // Set up the map overlay groups
  const nationalMapOverlayGroup1 = await findOrCreateMapOverlayGroup(
    models,
    'national_map_overlay_group_1_test',
  );
  const nationalMapOverlayGroup2 = await findOrCreateMapOverlayGroup(
    models,
    'national_map_overlay_group_2_test',
  );
  const projectLevelMapOverlayGroup1 = await findOrCreateMapOverlayGroup(
    models,
    'project_level_map_overlay_group_3_test',
  );

  // Set up the map overlay group relations
  const nationalMapOverlayGroupRelation1 = await findOrCreateMapOverlayGroupRelation(
    models,
    nationalMapOverlay1.id,
    nationalMapOverlayGroup1.id,
    'mapOverlay',
  );
  const nationalMapOverlayGroupRelation2 = await findOrCreateMapOverlayGroupRelation(
    models,
    nationalMapOverlay2.id,
    nationalMapOverlayGroup2.id,
    'mapOverlay',
  );
  const projectLevelMapOverlayGroupRelation1 = await findOrCreateMapOverlayGroupRelation(
    models,
    projectLevelMapOverlay1.id,
    projectLevelMapOverlayGroup1.id,
    'mapOverlay',
  );

  return {
    nationalMapOverlay1,
    nationalMapOverlay2,
    projectLevelMapOverlay1,

    nationalMapOverlayGroup1,
    nationalMapOverlayGroup2,
    projectLevelMapOverlayGroup1,

    nationalMapOverlayGroupRelation1,
    nationalMapOverlayGroupRelation2,
    projectLevelMapOverlayGroupRelation1,
  };
};
