import { respond } from '@tupaia/utils';
import { calculateBoundsFromEntities } from '/utils/geoJson';

async function fetchEntitiesWithProjectAccess(req, entities, userGroups) {
  return Promise.all(
    entities.map(async ({ id, name, code, bounds }) => ({
      id,
      name,
      code,
      bounds,
      hasAccess: await Promise.all(userGroups.map(u => req.userHasAccess(code, u))),
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
function getHomeEntityCode(project, entitiesWithAccess) {
  if (entitiesWithAccess.length === 1) {
    // only one entity (country) inside, return that code
    return entitiesWithAccess[0].code;
  }
  // more than one child entity, return the code of the project entity, which should have bounds
  // encompassing all children
  return project.entity_code;
}

async function buildProjectDataForFrontend(project, req) {
  const {
    id: projectId,
    name,
    code,
    description,
    sort_order: sortOrder,
    image_url: imageUrl,
    logo_url: logoUrl,
    user_groups: userGroups,
    entity_ids: entityIds,
    dashboard_group_name: dashboardGroupName,
    default_measure: defaultMeasure,
    tile_sets: tileSets,
  } = project;

  const entities = await Promise.all(entityIds.map(id => req.models.entity.findById(id)));
  const accessByEntity = await fetchEntitiesWithProjectAccess(req, entities, userGroups);
  const entitiesWithAccess = accessByEntity.filter(e => e.hasAccess.some(x => x));
  const names = entities.map(e => e.name);

  // This controls which entity the project zooms to and what level dashboards are shown on the front-end.
  // If a single entity is available, zoom to that, otherwise show the project entity
  const hasAccess = entitiesWithAccess.length > 0;
  const homeEntityCode = getHomeEntityCode(project, entitiesWithAccess);

  // Only want to check pending if no access
  const { userId } = req.session.userJson;
  const hasPendingAccess = hasAccess
    ? false
    : await fetchHasPendingProjectAccess(projectId, userId, req);

  return {
    name,
    code,
    userGroups,
    description,
    sortOrder,
    imageUrl,
    logoUrl,
    names,
    bounds: calculateBoundsFromEntities(entitiesWithAccess),
    hasAccess,
    hasPendingAccess,
    homeEntityCode,
    dashboardGroupName,
    defaultMeasure,
    tileSets,
  };
}

export async function getProjects(req, res) {
  const data = await req.models.project.getAllProjectDetails();

  const promises = data.map(project => buildProjectDataForFrontend(project, req));
  const projects = await Promise.all(promises);

  return respond(res, { projects });
}
