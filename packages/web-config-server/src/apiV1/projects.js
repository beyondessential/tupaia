import { respond } from '@tupaia/utils';

async function fetchEntitiesWithProjectAccess(req, entities, permissionGroups) {
  return Promise.all(
    entities.map(async ({ id, name, code }) => ({
      id,
      name,
      code,
      hasAccess: await Promise.all(permissionGroups.map(p => req.userHasAccess(code, p))),
    })),
  );
}

const fetchHasPendingProjectAccess = async (projectId, userId, req) => {
  if (!projectId || !userId) return false;

  const accessRequests = await req.models.accessRequest.find({
    user_id: userId,
    project_id: projectId,
    processed_date: null,
  });
  return accessRequests.length > 0;
};
// work out the entity to zoom to and open the dashboard of when this project is selected
function getHomeEntity(project, entitiesWithAccess, allEntities) {
  // more than one child entity, return the code of the project entity, which should have bounds
  const homeEntityCode =
    entitiesWithAccess.length === 1 ? entitiesWithAccess[0].code : project.entity_id;

  // return the entire entity object
  return allEntities.find(e => e.code === homeEntityCode);
}

// Fetch the project's default dashboard code using the dashboardGroupName, or the first dashboard code if the default dashboard can't be found
async function fetchDefaultDashboardCode(dashboardGroupName, entityHierachyId, homeEntity, req) {
  const dashboards = await req.models.dashboard.getDashboards(homeEntity, entityHierachyId);
  if (!dashboards.length) return 'General';
  const defaultDashboard = dashboards.find(d => d.name === dashboardGroupName);
  return defaultDashboard ? defaultDashboard.code : dashboards[0].code;
}

export async function buildProjectDataForFrontend(project, req) {
  const {
    id: projectId,
    name,
    code,
    description,
    sort_order: sortOrder,
    image_url: imageUrl,
    logo_url: logoUrl,
    permission_groups: permissionGroups,
    entity_ids: entityIds,
    dashboard_group_name: dashboardGroupName,
    default_measure: defaultMeasure,
    entity_hierachy_id: entityHierachyId,
    config,
  } = project;

  const entities = await Promise.all(entityIds.map(id => req.models.entity.findById(id))); // the return value of these is different to entitiesWithAccess
  const accessByEntity = await fetchEntitiesWithProjectAccess(req, entities, permissionGroups);
  const entitiesWithAccess = accessByEntity.filter(e => e.hasAccess.some(x => x));
  const names = entities.map(e => e.name);

  // This controls which entity the project zooms to and what level dashboards are shown on the front-end.
  // If a single entity is available, zoom to that, otherwise show the project entity
  const hasAccess = entitiesWithAccess.length > 0;
  const homeEntity = getHomeEntity(project, entitiesWithAccess, entities);
  const defaultDashboard = await fetchDefaultDashboardCode(
    dashboardGroupName,
    entityHierachyId,
    homeEntity,
    req,
  );

  // Only want to check pending if no access
  const { userId } = req.userJson;
  const hasPendingAccess = hasAccess
    ? false
    : await fetchHasPendingProjectAccess(projectId, userId, req);

  return {
    name,
    code,
    permissionGroups,
    description,
    sortOrder,
    imageUrl,
    logoUrl,
    names,
    hasAccess,
    hasPendingAccess,
    homeEntityCode: homeEntity.code,
    dashboardGroupName,
    defaultMeasure,
    config,
    defaultDashboard,
  };
}

export async function getProjects(req, res) {
  const data = await req.models.project.getAllProjectDetails();

  const promises = data.map(project => buildProjectDataForFrontend(project, req));
  const projects = await Promise.all(promises);

  return respond(res, { projects });
}
