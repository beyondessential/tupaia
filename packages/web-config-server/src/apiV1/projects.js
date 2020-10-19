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

async function buildProjectDataForFrontend(project, req) {
  const {
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
  const homeEntityCode = entitiesWithAccess.length === 1 ? entitiesWithAccess[0].code : code;

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
