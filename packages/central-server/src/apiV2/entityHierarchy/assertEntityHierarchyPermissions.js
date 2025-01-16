import { hasTupaiaAdminPanelAccess } from '../../permissions';

export const assertEntityHierarchyAdminPermissions = async (
  accessPolicy,
  models,
  entityHierarchyId,
) => {
  const error = new Error(
    `Need Tupaia Admin Panel access to hierarchy with id: '${entityHierarchyId}'`,
  );
  if (!hasTupaiaAdminPanelAccess(accessPolicy)) {
    throw error;
  }
  // find the project that has the entity hierarchy id in the user's accessible projects
  const projects = await models.project.getAccessibleProjects(accessPolicy);

  const project = projects.find(p => p.entity_hierarchy_id === entityHierarchyId);

  // if the project is not accessible to the user, throw an error
  if (!project) {
    throw error;
  }

  return true;
};
