/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  VIZ_BUILDER_PERMISSION_GROUP,
} from '../../permissions';

export const hasTupaiaAdminAccessToEntityForVisualisation = async (
  accessPolicy,
  models,
  entity,
) => {
  if (entity.isProject()) {
    const project = await models.project.findOne({ code: entity.code });
    const projectChildren = await entity.getChildrenViaHierarchy(project.entity_hierarchy_id);
    return accessPolicy.allowsAll(
      projectChildren.map(c => c.country_code),
      TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
    );
  }

  return accessPolicy.allows(entity.country_code, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);
};

export const hasVizBuilderAccessToEntityForVisualisation2 = async (
  accessPolicy,
  models,
  entity,
) => {
  if (entity.isProject()) {
    const project = await models.project.findOne({ code: entity.code });
    const projectChildren = await entity.getChildrenViaHierarchy(project.entity_hierarchy_id);
    return accessPolicy.allowsAll(
      projectChildren.map(c => c.country_code),
      VIZ_BUILDER_PERMISSION_GROUP,
    );
  }

  return accessPolicy.allows(entity.country_code, VIZ_BUILDER_PERMISSION_GROUP);
};
