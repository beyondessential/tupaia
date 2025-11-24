import { generateId, findOrCreateDummyRecord } from '@tupaia/database';
import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp, resetTestData } from '../../testUtilities';
import { setupProject } from './utils';

describe('Deleting a landing page', async () => {
  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
  };

  const TUPAIA_ADMIN_POLICY = {
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Public'],
  };

  const app = new TestableApp();
  const { models } = app;

  const LANDING_PAGE = {
    id: generateId(),
    image_url: 'www.image.com',
    logo_url: 'www.image.com',
    extended_title: 'extended title',
    project_codes: '{test_project1}',
  };

  before(async () => {
    await setupProject(models);
  });
  beforeEach(async () => {
    await findOrCreateDummyRecord(models.landingPage, LANDING_PAGE);
  });

  afterEach(async () => {
    await models.landingPage.delete({ id: LANDING_PAGE.id });
    app.revokeAccess();
  });

  after(async () => {
    await resetTestData();
  });

  describe('Permissions checker', async () => {
    it('Successfully deletes a landingPage record if the user has BES Admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);

      const result = await app.delete(`landingPages/${LANDING_PAGE.id}`);

      expect(result.status).to.equal(200);
    });
    it('Successfully deletes a landingPage record if the user has access to the admin panel and a project on the landing page', async () => {
      await app.grantAccess(TUPAIA_ADMIN_POLICY);

      const result = await app.delete(`landingPages/${LANDING_PAGE.id}`);

      expect(result.status).to.equal(200);
    });

    it('Throws an error if the user has admin permission but no access to any projects in the landing page', async () => {
      await app.grantAccess({
        TO: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
      });

      const result = await app.delete(`landingPages/${LANDING_PAGE.id}`);
      expect(result.text).to.equal(
        '{"error":"One of the following conditions need to be satisfied:\\nNeed BES Admin access\\nNeed access to a project that the landing page belongs to."}',
      );
    });

    it('Throws an error if the user has permission for the project but not admin panel permissions', async () => {
      await app.grantAccess({
        DL: ['Public'],
      });

      const result = await app.delete(`landingPages/${LANDING_PAGE.id}`);
      expect(result.text).to.equal(
        '{"error":"One of the following conditions need to be satisfied:\\nNeed BES Admin access\\nNeed Tupaia Admin Panel access"}',
      );
    });
  });
});
