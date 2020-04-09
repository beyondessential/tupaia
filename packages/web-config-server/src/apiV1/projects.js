import { respond } from '@tupaia/utils';
import { Project, Entity } from '/models';
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
  } = project;

  const entities = await Promise.all(entityIds.map(id => Entity.findById(id)));
  const accessByEntity = await fetchEntitiesWithProjectAccess(req, entities, userGroups);
  const entitiesWithAccess = accessByEntity.filter(e => e.hasAccess.some(x => x));
  const names = entities.map(e => e.name);

  // TODO: Remove once project dashboards are implemented.
  // This dumb version naively assumed all entities of a project
  // have the same parent, which for now is true as projects are all
  // at country/multi-country level, so parent will be world,
  // or if it only has a single entity, use that as the parent.
  // This controls where the project zooms to and what level dashboards
  // are shown on the front-end.
  const hasAccess = entitiesWithAccess.length > 0; // equivalent to accessByEntity.some(e => e.hasAccess)
  const parentCode =
    hasAccess &&
    (entitiesWithAccess.length > 1 ? 'World' : entitiesWithAccess[0].organisationUnitCode);

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
    parentCode,
    dashboardGroupName,
    defaultMeasure,
  };
}

export async function getProjects(req, res) {
  const data = await Project.getProjectDetails();

  const promises = data.map(project => buildProjectDataForFrontend(project, req));
  const projects = await Promise.all(promises);

  return respond(res, { projects });
}
