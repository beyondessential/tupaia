import { NotFoundError, respond } from '@tupaia/utils';

const FRONTEND_EXCLUDED_PROJECTS = /** @type {const} */ ([
  'ehealth_cook_islands',
  'ehealth_tokelau',
  'ehealth_timor_leste',
  'ehealth_vanuatu',
]);

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
function getHomeEntityCode(project, entitiesWithAccess) {
  if (entitiesWithAccess.length === 1) {
    // only one entity (country) inside, return that code
    return entitiesWithAccess[0].code;
  }
  // more than one child entity, return the code of the project entity, which should have bounds
  // encompassing all children
  return project.entity_code;
}

export async function buildProjectDataForFrontend(project, req) {
  const {
    id: projectId,
    name,
    code,
    description,
    entity_code: entityCode,
    sort_order: sortOrder,
    image_url: imageUrl,
    logo_url: logoUrl,
    permission_groups: permissionGroups,
    entity_ids: entityIds,
    dashboard_group_name: dashboardGroupName,
    default_measure: defaultMeasure,
    config,
  } = project;

  const entities = await Promise.all(entityIds.map(id => req.models.entity.findById(id))); // the return value of these is different to entitiesWithAccess
  const accessByEntity = await fetchEntitiesWithProjectAccess(req, entities, permissionGroups);
  const entitiesWithAccess = accessByEntity.filter(e => e.hasAccess.some(x => x));
  const names = entities.map(e => e.name);

  // This controls which entity the project zooms to and what level dashboards are shown on the front-end.
  // If a single entity is available, zoom to that, otherwise show the project entity
  const hasAccess = entitiesWithAccess.length > 0;
  const homeEntityCode = getHomeEntityCode(project, entitiesWithAccess);

  // Only want to check pending if no access
  const { userId } = req.userJson;
  const hasPendingAccess = hasAccess
    ? false
    : await fetchHasPendingProjectAccess(projectId, userId, req);

  return {
    id: projectId,
    name,
    code,
    permissionGroups,
    description,
    entityCode,
    sortOrder,
    imageUrl,
    logoUrl,
    names,
    hasAccess,
    hasPendingAccess,
    homeEntityCode,
    dashboardGroupName,
    defaultMeasure,
    config,
  };
}

export async function getProjects(req, res) {
  const { showExcludedProjects } = req.query;

  // allow 'false' or false to be falsey (as it depends on the query coming from the server or client side)
  const isFalsey = value => value === 'false' || value === false;
  const shouldShowExcludedProjects = !isFalsey(showExcludedProjects);

  /**
   * Filter out projects that should not be shown on the frontend, if the query param is set.
   * Defaults to true, because tupaia-web should be false, whereas datatrak-web will be true, and
   * there are more places where we want to show all projects than not.
   */
  const where = shouldShowExcludedProjects
    ? undefined
    : {
        code: {
          comparator: 'not in',
          comparisonValue: FRONTEND_EXCLUDED_PROJECTS,
        },
      };
  const _projects = await req.models.project.getAllProjectDetails(where);

  const promises = _projects.map(project => buildProjectDataForFrontend(project, req));
  const projects = await Promise.all(promises);

  return respond(res, { projects });
}

export async function getProject(req, res) {
  const code = req.params.projectCode;
  const [_project] = await req.models.project.getAllProjectDetails({ code });

  if (_project === undefined) {
    throw new NotFoundError(`No project found with code ‘${code}’`);
  }

  const project = await buildProjectDataForFrontend(_project, req);
  return respond(res, project);
}
