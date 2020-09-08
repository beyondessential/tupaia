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
