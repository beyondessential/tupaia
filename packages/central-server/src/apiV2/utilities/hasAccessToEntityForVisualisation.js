import { VIZ_BUILDER_PERMISSION_GROUP } from '../../permissions';

/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
export const hasAccessToEntityForVisualisation = async (
  accessPolicy,
  models,
  entity,
  permissionGroup,
) => {
  if (entity.isProject()) {
    const project = await models.project.findOne({ code: entity.code });
    const projectChildren = await entity.getChildrenViaHierarchy(project.entity_hierarchy_id);
    return accessPolicy.allowsSome(
      projectChildren.map(c => c.country_code),
      permissionGroup,
    );
  }

  return accessPolicy.allows(entity.country_code, permissionGroup);
};

/**
 * Check user has permission to ALL given entities,as well as Viz Builder Access to ALL given entities
 */
export const hasVizBuilderAccessToEntityForVisualisation = async (accessPolicy, models, entity) => {
  // If entity is a project, check if user has access to all countries in the project
  if (entity.isProject()) {
    const project = await models.project.findOne({ code: entity.code });
    const projectChildren = await entity.getChildrenViaHierarchy(project.entity_hierarchy_id);
    const countryCodes = projectChildren.map(c => c.country_code);
    return accessPolicy.allowsAll(countryCodes, VIZ_BUILDER_PERMISSION_GROUP);
  }

  return accessPolicy.allows(entity.country_code, VIZ_BUILDER_PERMISSION_GROUP);
};
