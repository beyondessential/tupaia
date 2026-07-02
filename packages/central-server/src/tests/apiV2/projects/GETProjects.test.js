import { expect } from 'chai';
import { findOrCreateDummyRecord, generateId } from '@tupaia/database';
import { TestableApp } from '../../testUtilities';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';

const getFilterString = filter => `filter=${JSON.stringify(filter)}`;
// remove test data after the test is finished
const removeTestData = async (models, projectCode) => {
  const project = await models.project.findOne({ code: projectCode });
  if (project) {
    await models.projectCountry.delete({ project_id: project.id });
  }
  await models.project.delete({ code: projectCode });
  const projectEntity = await models.entity.findOne({ code: projectCode, type: 'project' });
  if (projectEntity !== null) {
    await models.entity.delete({ id: projectEntity.id });
  }
};

// generate the test data for the provided project code
const createTestData = async (models, projectCode, permissionGroup, countryEntityId) => {
  const { id: projectEntityId } = await findOrCreateDummyRecord(models.entity, {
    code: projectCode,
    type: 'project',
  });
  const project = await findOrCreateDummyRecord(
    models.project,
    {
      id: generateId(),
      code: projectCode,
      entity_id: projectEntityId,
    },
    {
      permission_groups: [permissionGroup],
    },
  );
  await findOrCreateDummyRecord(models.projectCountry, {
    project_id: project.id,
    country_id: countryEntityId,
  });
  return project;
};

describe('Permissions checker for GETProjects', async () => {
  const DEFAULT_POLICY = {
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
    TO: ['Admin'],
  };

  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
  };

  const PUBLIC_POLICY = {
    DL: ['Public'],
  };

  const PROJECT_CODES = [
    {
      code: 'test_project_1',
      permissionGroupName: TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
      countryCode: 'DL',
    },
    {
      code: 'test_project_2',
      permissionGroupName: 'Admin',
      countryCode: 'DL',
    },
    // Only country is TO, where DEFAULT_POLICY has no Tupaia Admin Panel access —
    // so it's visible without the admin-panel flag but hidden with it.
    {
      code: 'test_project_3',
      permissionGroupName: 'Admin',
      countryCode: 'TO',
    },
    // In DL (where DEFAULT_POLICY does have Tupaia Admin Panel), but its
    // permission group isn't one DEFAULT_POLICY holds — so the user has no
    // project access. Must be hidden both with and without the flag (admin-panel
    // access to a country isn't enough without project access).
    {
      code: 'test_project_4',
      permissionGroupName: 'UNFPA',
      countryCode: 'DL',
    },
  ];

  const app = new TestableApp();
  const { models } = app;
  let projects;
  let filterString;

  before(async () => {
    await findOrCreateDummyRecord(models.permissionGroup, {
      name: TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
    });
    await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });

    const countryEntityIdsByCode = {};
    for (const countryCode of ['DL', 'TO']) {
      const { id } = await findOrCreateDummyRecord(models.entity, {
        code: countryCode,
        country_code: countryCode,
        type: 'country',
      });
      countryEntityIdsByCode[countryCode] = id;
    }
    // Set up test projects in the database
    projects = await Promise.all(
      PROJECT_CODES.map(({ code, permissionGroupName, countryCode }) =>
        createTestData(models, code, permissionGroupName, countryEntityIdsByCode[countryCode]),
      ),
    );

    filterString = getFilterString({
      id: { comparator: 'in', comparisonValue: projects.map(project => project.id) },
    });
  });

  afterEach(() => {
    app.revokeAccess();
  });

  after(async () => {
    await Promise.all(PROJECT_CODES.map(({ code }) => removeTestData(models, code)));
  });

  describe('GET /projects/:id', async () => {
    it('Sufficient permissions: returns a requested project when user has BES admin permissions', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.get(`projects/${projects[0].id}`);
      expect(result.id).to.equal(projects[0].id);
    });

    it('Sufficient permissions: returns a requested project when user has permissions', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`projects/${projects[0].id}`);
      expect(result.id).to.equal(projects[0].id);
    });

    it('Insufficient permissions: throws an error if requesting project when user does not have permissions', async () => {
      await app.grantAccess(PUBLIC_POLICY);
      const { body: result } = await app.get(`projects/${projects[0].id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /projects', async () => {
    it('Sufficient permissions: returns all projects if the user has BES admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`projects?${filterString}`);
      expect(results.length).to.equal(projects.length);
      const resultIds = results.map(r => r.id);
      projects.forEach(project => {
        expect(resultIds.includes(project.id)).to.equal(true);
      });
    });

    it('Sufficient permissions: returns projects the user has project access to', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`projects?${filterString}`);
      const resultIds = results.map(r => r.id);
      // Access via a held permission group on a member country.
      expect(resultIds).to.include(projects[0].id);
      expect(resultIds).to.include(projects[1].id);
      expect(resultIds).to.include(projects[2].id);
      // test_project_4's permission group (UNFPA) isn't held by this user, so no
      // project access — excluded even without the admin-panel flag.
      expect(resultIds).to.not.include(projects[3].id);
    });

    it('Insufficient permissions: returns an empty array if users do not have access to any project', async () => {
      await app.grantAccess(PUBLIC_POLICY);
      const { body: results } = await app.get(`projects?${filterString}`);

      expect(results).to.be.empty;
    });
  });

  describe('GET /projects?requireAdminPanelCountryAccess=true', async () => {
    it('requires both project access AND Tupaia Admin Panel access to a member country', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(
        `projects?${filterString}&requireAdminPanelCountryAccess=true`,
      );
      const resultIds = results.map(r => r.id);
      // 1 & 2: in DL, where the user has both project access and Tupaia Admin Panel.
      expect(resultIds).to.include(projects[0].id);
      expect(resultIds).to.include(projects[1].id);
      // 3: project access via Admin@TO, but no Tupaia Admin Panel on TO → excluded.
      expect(resultIds).to.not.include(projects[2].id);
      // 4: Tupaia Admin Panel on DL, but no project access (UNFPA not held) → excluded.
      expect(resultIds).to.not.include(projects[3].id);
    });

    it('returns all accessible projects for a BES admin', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(
        `projects?${filterString}&requireAdminPanelCountryAccess=true`,
      );
      const resultIds = results.map(r => r.id);
      projects.forEach(project => {
        expect(resultIds.includes(project.id)).to.equal(true);
      });
    });

    it('returns an empty array when the user has no Tupaia Admin Panel country access', async () => {
      await app.grantAccess(PUBLIC_POLICY);
      const { body: results } = await app.get(
        `projects?${filterString}&requireAdminPanelCountryAccess=true`,
      );

      expect(results).to.be.empty;
    });
  });
});
