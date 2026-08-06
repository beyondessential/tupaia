import { buildProjectsDataForFrontend } from '../../apiV1/projects';

const TONGA = {
  id: 'entity_tonga',
  name: 'Tonga',
  code: 'TO',
  country_code: 'TO',
  type: 'country',
};
const FIJI = {
  id: 'entity_fiji',
  name: 'Fiji',
  code: 'FJ',
  country_code: 'FJ',
  type: 'country',
};
const KIRIBATI = {
  id: 'entity_kiribati',
  name: 'Kiribati',
  code: 'KI',
  country_code: 'KI',
  type: 'country',
};
const WORLD = {
  id: 'entity_world',
  name: 'World',
  code: 'World',
  country_code: null,
  type: 'world',
};

const ENTITIES = [TONGA, FIJI, KIRIBATI, WORLD].map(entity => ({
  ...entity,
  isProject: () => entity.type === 'project',
}));

const buildProject = ({ id, code, entityIds, permissionGroups }) => ({
  id,
  code,
  name: `Project ${code}`,
  entity_ids: entityIds,
  entity_code: `${code}_entity`,
  description: `Description of ${code}`,
  sort_order: null,
  permission_groups: permissionGroups,
  entity_id: `${id}_entity_id`,
  image_url: `https://example.com/${code}.png`,
  logo_url: null,
  dashboard_group_name: 'General',
  default_measure: '126',
  config: {},
  entity_hierarchy_id: `${id}_hierarchy`,
});

// User has 'Admin' access to Tonga only
const ACCESS_POLICY_BY_COUNTRY = { TO: ['Admin'] };

const PENDING_ACCESS_REQUESTS = [{ user_id: 'user1', project_id: 'project_pending' }];

const createMockReq = ({ userJson = { userId: 'user1' } } = {}) => ({
  userJson,
  accessPolicy: {
    allows: (countryCode, permissionGroup) =>
      !!ACCESS_POLICY_BY_COUNTRY[countryCode]?.includes(permissionGroup),
  },
  userHasAccess: jest.fn(),
  models: {
    entity: {
      find: jest.fn(async ({ id: ids }) => ENTITIES.filter(entity => ids.includes(entity.id))),
    },
    accessRequest: {
      find: jest.fn(async ({ user_id: userId, project_id: projectIds }) =>
        PENDING_ACCESS_REQUESTS.filter(
          accessRequest =>
            accessRequest.user_id === userId && projectIds.includes(accessRequest.project_id),
        ),
      ),
    },
  },
});

describe('buildProjectsDataForFrontend()', () => {
  const accessibleProject = buildProject({
    id: 'project_accessible',
    code: 'accessible',
    entityIds: [TONGA.id, FIJI.id],
    permissionGroups: ['Admin', 'Donor'],
  });
  const pendingProject = buildProject({
    id: 'project_pending',
    code: 'pending',
    entityIds: [KIRIBATI.id],
    permissionGroups: ['Admin'],
  });
  const inaccessibleProject = buildProject({
    id: 'project_inaccessible',
    code: 'inaccessible',
    entityIds: [FIJI.id, KIRIBATI.id],
    permissionGroups: ['Admin'],
  });
  const worldProject = buildProject({
    id: 'project_world',
    code: 'world',
    entityIds: [FIJI.id, WORLD.id],
    permissionGroups: ['Admin'],
  });
  const allProjects = [accessibleProject, pendingProject, inaccessibleProject, worldProject];

  it('translates project fields for the frontend', async () => {
    const req = createMockReq();
    const [project] = await buildProjectsDataForFrontend([accessibleProject], req);
    expect(project).toStrictEqual({
      id: 'project_accessible',
      name: 'Project accessible',
      code: 'accessible',
      permissionGroups: ['Admin', 'Donor'],
      description: 'Description of accessible',
      entityCode: 'accessible_entity',
      sortOrder: null,
      imageUrl: 'https://example.com/accessible.png',
      logoUrl: null,
      names: ['Tonga', 'Fiji'],
      hasAccess: true,
      hasPendingAccess: false,
      homeEntityCode: 'TO', // single accessible member entity, so zoom straight to it
      dashboardGroupName: 'General',
      defaultMeasure: '126',
      config: {},
    });
  });

  it('computes access flags and home entity per project', async () => {
    const req = createMockReq();
    const projects = await buildProjectsDataForFrontend(allProjects, req);
    expect(projects.map(({ code, hasAccess, hasPendingAccess, homeEntityCode }) => ({
      code,
      hasAccess,
      hasPendingAccess,
      homeEntityCode,
    }))).toStrictEqual([
      // Access to Tonga via 'Admin'; single accessible entity becomes home entity
      { code: 'accessible', hasAccess: true, hasPendingAccess: false, homeEntityCode: 'TO' },
      // No access, but an unprocessed access request exists
      {
        code: 'pending',
        hasAccess: false,
        hasPendingAccess: true,
        homeEntityCode: 'pending_entity',
      },
      // No access, no pending request
      {
        code: 'inaccessible',
        hasAccess: false,
        hasPendingAccess: false,
        homeEntityCode: 'inaccessible_entity',
      },
      // World member entities are always accessible
      { code: 'world', hasAccess: true, hasPendingAccess: false, homeEntityCode: 'World' },
    ]);
  });

  it('batches database access into a single entity query and a single access request query', async () => {
    const req = createMockReq();
    await buildProjectsDataForFrontend(allProjects, req);

    expect(req.models.entity.find).toHaveBeenCalledTimes(1);
    expect(req.models.entity.find).toHaveBeenCalledWith({
      id: [TONGA.id, FIJI.id, KIRIBATI.id, WORLD.id],
    });

    // Pending access is only checked for the projects without access
    expect(req.models.accessRequest.find).toHaveBeenCalledTimes(1);
    expect(req.models.accessRequest.find).toHaveBeenCalledWith({
      user_id: 'user1',
      project_id: ['project_pending', 'project_inaccessible'],
      processed_date: null,
    });
  });

  it('skips the pending access check for users without an id (public user)', async () => {
    const req = createMockReq({ userJson: { userName: 'public' } });
    const projects = await buildProjectsDataForFrontend([pendingProject], req);
    expect(req.models.accessRequest.find).not.toHaveBeenCalled();
    expect(projects[0].hasPendingAccess).toBe(false);
  });

  it('reports no access when there is no access policy', async () => {
    const req = createMockReq();
    req.accessPolicy = null;
    const projects = await buildProjectsDataForFrontend([accessibleProject], req);
    expect(projects[0].hasAccess).toBe(false);
  });
});
