/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { findOrCreateDummyRecord } from '@tupaia/database';

const nationalMapOverlayGroupRelation1Id = 'mapoverlaytestingid00001';
const nationalMapOverlayGroupRelation2Id = 'mapoverlaytestingid00002';
const projectLevelMapOverlayGroupRelation1Id = 'mapoverlaytestingid00003';
const nationalMapOverlayGroup1RootRelationId = 'mapoverlaytestingid00004';
const nationalMapOverlayGroup2RootRelationId = 'mapoverlaytestingid00005';
const projectLevelMapOverlayGroupRootRelationId = 'mapoverlaytestingid00006';
const nationalMapOverlay1Id = 'mapoverlaytestingid00007';
const nationalMapOverlay2Id = 'mapoverlaytestingid00008';
const projectLevelMapOverlay1Id = 'mapoverlaytestingid00009';
const nationalMapOverlayGroup1Id = 'mapoverlaytestingid00010';
const nationalMapOverlayGroup2Id = 'mapoverlaytestingid00011';
const projectLevelMapOverlayGroup1Id = 'mapoverlaytestingid00012';
const rootOverlayGroupId = 'mapoverlaytestingid00013';

export const findOrCreateMapOverlay = async (models, name, countryCode, recordId) => {
  // Set up the map overlays
  return findOrCreateDummyRecord(
    models.mapOverlay,
    { id: recordId },
    {
      name,
      permission_group: 'Admin',
      country_codes: [countryCode],
    },
  );
};

export const findOrCreateMapOverlayGroup = async (models, code, recordId) => {
  // Set up the map overlays
  return findOrCreateDummyRecord(
    models.mapOverlayGroup,
    { id: recordId },
    {
      name: code,
      code,
    },
  );
};

export const findOrCreateMapOverlayGroupRelation = async (
  models,
  overlayId,
  groupId,
  childType,
  recordId,
) => {
  // Set up the map overlays
  return findOrCreateDummyRecord(
    models.mapOverlayGroupRelation,
    { id: recordId },
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
    nationalMapOverlay1Id,
  );
  const nationalMapOverlay2 = await findOrCreateMapOverlay(
    models,
    'national_map_overlay_2_test',
    'LA',
    nationalMapOverlay2Id,
  );

  const projectLevelMapOverlay1 = await findOrCreateMapOverlay(
    models,
    'project_level_map_overlay_3_test',
    'test_project',
    projectLevelMapOverlay1Id,
  );

  // Create root map overlay group
  const rootOverlayGroup = await findOrCreateMapOverlayGroup(
    models,
    models.mapOverlayGroup.RootMapOverlayGroupCode,
    rootOverlayGroupId,
  );

  // Set up the map overlay groups
  const nationalMapOverlayGroup1 = await findOrCreateMapOverlayGroup(
    models,
    'national_map_overlay_group_1_test',
    nationalMapOverlayGroup1Id,
  );

  const nationalMapOverlayGroup2 = await findOrCreateMapOverlayGroup(
    models,
    'national_map_overlay_group_2_test',
    nationalMapOverlayGroup2Id,
  );
  const projectLevelMapOverlayGroup1 = await findOrCreateMapOverlayGroup(
    models,
    'project_level_map_overlay_group_3_test',
    projectLevelMapOverlayGroup1Id,
  );

  // Set up the map overlay group relations
  const nationalMapOverlayGroupRelation1 = await findOrCreateMapOverlayGroupRelation(
    models,
    nationalMapOverlay1.id,
    nationalMapOverlayGroup1.id,
    'mapOverlay',
    nationalMapOverlayGroupRelation1Id,
  );
  const nationalMapOverlayGroupRelation2 = await findOrCreateMapOverlayGroupRelation(
    models,
    nationalMapOverlay2.id,
    nationalMapOverlayGroup2.id,
    'mapOverlay',
    nationalMapOverlayGroupRelation2Id,
  );
  const projectLevelMapOverlayGroupRelation1 = await findOrCreateMapOverlayGroupRelation(
    models,
    projectLevelMapOverlay1.id,
    projectLevelMapOverlayGroup1.id,
    'mapOverlay',
    projectLevelMapOverlayGroupRelation1Id,
  );

  const nationalMapOverlayGroup1RootRelation = await findOrCreateMapOverlayGroupRelation(
    models,
    nationalMapOverlayGroup1.id,
    rootOverlayGroup.id,
    'mapOverlayGroup',
    nationalMapOverlayGroup1RootRelationId,
  );
  const nationalMapOverlayGroup2RootRelation = await findOrCreateMapOverlayGroupRelation(
    models,
    nationalMapOverlayGroup2.id,
    rootOverlayGroup.id,
    'mapOverlayGroup',
    nationalMapOverlayGroup2RootRelationId,
  );
  const projectLevelMapOverlayGroupRootRelation = await findOrCreateMapOverlayGroupRelation(
    models,
    projectLevelMapOverlayGroup1.id,
    rootOverlayGroup.id,
    'mapOverlayGroup',
    projectLevelMapOverlayGroupRootRelationId,
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

    nationalMapOverlayGroup1RootRelation,
    nationalMapOverlayGroup2RootRelation,
    projectLevelMapOverlayGroupRootRelation,
  };
};
