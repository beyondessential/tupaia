import { generateId, findOrCreateRecords } from '@tupaia/database';
import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp, resetTestData } from '../../testUtilities';
import { setupProject } from './utils';

describe('GETLandingPages', async () => {
  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
  };

  const TUPAIA_ADMIN_POLICY = {
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Public'],
  };

  const app = new TestableApp();
  const { models } = app;

  const LANDING_PAGES = [
    {
      id: generateId(),
      image_url: 'www.image.com',
      logo_url: 'www.image.com',
      extended_title: 'extended title',
      project_codes: '{test_project1}',
    },
    {
      id: generateId(),
      image_url: 'www.image.com',
      logo_url: 'www.image.com',
      extended_title: 'extended title',
      project_codes: '{test_project3}',
    },
  ];

  before(async () => {
    await setupProject(models);
    await findOrCreateRecords(models, {
      landingPage: LANDING_PAGES,
    });
  });

  afterEach(async () => {
    app.revokeAccess();
  });

  after(async () => {
    await Promise.all(
      LANDING_PAGES.map(landingPage => models.landingPage.delete({ id: landingPage.id })),
    );
    await resetTestData();
  });

  describe('Single record request', async () => {
    it('Successfully gets a single landingPage record if the user has BES Admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);

      const result = await app.get(`landingPages/${LANDING_PAGES[0].id}`);

      expect(result.status).to.equal(200);
      expect(result.body.id).to.equal(LANDING_PAGES[0].id);
    });
    it('Successfully gets a landingPage record if the user has access to the admin panel and a project on the landing page', async () => {
      await app.grantAccess(TUPAIA_ADMIN_POLICY);

      const result = await app.get(`landingPages/${LANDING_PAGES[0].id}`);

      expect(result.status).to.equal(200);
      expect(result.body.id).to.equal(LANDING_PAGES[0].id);
    });

    it('Throws an error if the user has admin permission but no access to any projects in the landing page', async () => {
      await app.grantAccess({
        TO: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
      });

      const result = await app.get(`landingPages/${LANDING_PAGES[0].id}`);
      expect(result.text).to.equal(
        '{"error":"One of the following conditions need to be satisfied:\\nNeed BES Admin access\\nNeed access to a project that the landing page belongs to."}',
      );
    });

    it('Throws an error if the user has permission for the project but not admin panel permissions', async () => {
      await app.grantAccess({
        DL: ['Public'],
      });

      const result = await app.get(`landingPages/${LANDING_PAGES[0].id}`);
      expect(result.text).to.equal('{"error":"Need Tupaia Admin Panel access"}');
    });
  });

  describe('Multiple records request', async () => {
    it('Successfully gets all landing pages when user has BES Admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);

      const result = await app.get('landingPages');

      expect(result.status).to.equal(200);
      expect(result.body.length).to.equal(2);
    });
    it('Successfully gets only landing pages the user has admin panel and project access to', async () => {
      await app.grantAccess(TUPAIA_ADMIN_POLICY);

      const result = await app.get('landingPages');

      expect(result.status).to.equal(200);
      expect(result.body.length).to.equal(1);
      expect(result.body[0].id).to.equal(LANDING_PAGES[0].id);
    });

    it('Successfully gets only landing pages the user has admin panel and project access to, while also filtering by project codes if in the query', async () => {
      await app.grantAccess(TUPAIA_ADMIN_POLICY);
      const filterString = `filter={"landing_page.project_codes":{"comparator":"@>","comparisonValue":"{test_project1,test_project3}"}}`;
      const result = await app.get(`landingPages?${filterString}`);

      expect(result.status).to.equal(200);
      expect(result.body[0].id).to.equal(LANDING_PAGES[0].id);
    });

    it('Throws an error if a project_codes filter is applied to the query and the user has no access to any projects in the filter', async () => {
      await app.grantAccess(TUPAIA_ADMIN_POLICY);
      const filterString = `filter={"landing_page.project_codes":{"comparator":"@>","comparisonValue":"{test_project3}"}}`;
      const result = await app.get(`landingPages?${filterString}`);

      expect(result.status).to.equal(403);

      expect(result.text).to.equal('{"error":"No access to project codes in query"}');
    });

    it('Throws an error if user does not have admin panel access', async () => {
      await app.grantAccess({
        DL: ['Public'],
      });
      const result = await app.get('landingPages');

      expect(result.status).to.equal(403);

      expect(result.text).to.equal('{"error":"Need Tupaia Admin Panel access"}');
    });

    it('Throws an error if user does not have access to any projects', async () => {
      await app.grantAccess({
        TO: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
      });
      const result = await app.get('landingPages');

      expect(result.status).to.equal(500);

      expect(result.text).to.equal('{"error":"Internal server error: No projects found for user"}');
    });
  });
});
