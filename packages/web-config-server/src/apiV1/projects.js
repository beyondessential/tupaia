import { uniq } from 'es-toolkit';
import { NotFoundError, respond } from '@tupaia/utils';

const FRONTEND_EXCLUDED_PROJECTS = /** @type {const} */ ([
  'ehealth_cook_islands',
  'ehealth_timor_leste',
  'ehealth_vanuatu',
]);

/**
 * In-memory equivalent of `req.userHasAccess` for an already-fetched entity, so checking access
 * for every (entity, permission group) pair doesn't cost a DB query each.
 */
async function userHasEntityAccess(req, entity, permissionGroup) {
  const { accessPolicy } = req;
  if (!accessPolicy) {
    return false;
  }

  // Assume user always has access to all world items
  if (entity.code === 'World') {
    return true;
  }

  // Project access rights are determined by their children. Passing the entity record (rather
  // than its code) avoids a redundant fetch. Rare for a project member entity to itself be a
  // project, so the extra queries in this branch are acceptable.
  if (entity.isProject()) {
    return req.userHasAccess(entity, permissionGroup);
  }

  return accessPolicy.allows(entity.country_code, permissionGroup);
}

async function userHasSomePermissionGroupAccess(req, entity, permissionGroups) {
  for (const permissionGroup of permissionGroups) {
    if (await userHasEntityAccess(req, entity, permissionGroup)) return true;
  }
  return false;
}

/**
 * @returns {Promise<Set<string>>} ids of the given projects for which the user has an unprocessed
 * access request
 */
const fetchProjectIdsWithPendingAccess = async (projectIds, userId, req) => {
  if (!userId || projectIds.length === 0) return new Set();
  const accessRequests = await req.models.accessRequest.find(
    {
      user_id: userId,
      project_id: projectIds,
      approved: null,
    },
    { columns: ['project_id'], distinct: true },
  );
  return new Set(accessRequests.map(accessRequest => accessRequest.project_id));
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

export async function buildProjectsDataForFrontend(projects, req) {
  // Fetch the member entities of all projects in a single query
  const allEntityIds = uniq(projects.flatMap(project => project.entity_ids ?? []));
  const allEntities =
    allEntityIds.length > 0 ? await req.models.entity.find({ id: allEntityIds }) : [];
  const entitiesById = new Map(allEntities.map(entity => [entity.id, entity]));

  // Work out which member entities the user has access to; in-memory against the access policy
  const accessInfoByProjectId = new Map();
  for (const project of projects) {
    const entities = (project.entity_ids ?? [])
      .map(id => entitiesById.get(id))
      .filter(entity => entity !== undefined);
    const entitiesWithAccess = [];
    for (const entity of entities) {
      if (await userHasSomePermissionGroupAccess(req, entity, project.permission_groups)) {
        entitiesWithAccess.push(entity);
      }
    }
    accessInfoByProjectId.set(project.id, { entities, entitiesWithAccess });
  }

  // Only want to check pending access for projects with no access; single query for all of them
  const { userId } = req.userJson;
  const noAccessProjectIds = projects
    .filter(project => accessInfoByProjectId.get(project.id).entitiesWithAccess.length === 0)
    .map(project => project.id);
  const projectIdsWithPendingAccess = await fetchProjectIdsWithPendingAccess(
    noAccessProjectIds,
    userId,
    req,
  );

  return projects.map(project => {
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
      dashboard_group_name: dashboardGroupName,
      default_measure: defaultMeasure,
      config,
    } = project;

    const { entities, entitiesWithAccess } = accessInfoByProjectId.get(projectId);

    // This controls which entity the project zooms to and what level dashboards are shown on the front-end.
    // If a single entity is available, zoom to that, otherwise show the project entity
    const hasAccess = entitiesWithAccess.length > 0;
    const homeEntityCode = getHomeEntityCode(project, entitiesWithAccess);

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
      names: entities.map(e => e.name),
      hasAccess,
      hasPendingAccess: projectIdsWithPendingAccess.has(projectId),
      homeEntityCode,
      dashboardGroupName,
      defaultMeasure,
      config,
    };
  });
}

export async function buildProjectDataForFrontend(project, req) {
  const [projectData] = await buildProjectsDataForFrontend([project], req);
  return projectData;
}

export async function getProjects(req, res) {
  const showExcludedProjects = !isConsideredFalse(req.query.showExcludedProjects);
  /**
   * Filter out projects that should not be shown on the frontend, if the query param is set.
   * Defaults to true, because tupaia-web should be false, whereas datatrak-web will be true, and
   * there are more places where we want to show all projects than not.
   */
  const where = showExcludedProjects
    ? undefined
    : {
        code: {
          comparator: 'not in',
          comparisonValue: FRONTEND_EXCLUDED_PROJECTS,
        },
      };
  const _projects = await req.models.project.getAllProjectDetails(where);

  const projects = await buildProjectsDataForFrontend(_projects, req);

  return respond(res, { projects });
}

export async function getProject(req, res) {
  const code = req.params.projectCode;
  const showExcludedProjects = !isConsideredFalse(req.query.showExcludedProjects);

  if (!showExcludedProjects && FRONTEND_EXCLUDED_PROJECTS.includes(code)) {
    throw new NotFoundError(`No project found with code ‘${code}’`);
  }

  const [_project] = await req.models.project.getAllProjectDetails({ code });
  if (_project === undefined) {
    throw new NotFoundError(`No project found with code ‘${code}’`);
  }

  const project = await buildProjectDataForFrontend(_project, req);
  return respond(res, project);
}

/**
 * Allow 'false' or false to be falsy (as it depends on the query coming from the server or client
 * side)
 */
function isConsideredFalse(val) {
  return val === false || val === 'false';
}
