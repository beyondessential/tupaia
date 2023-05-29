/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { generateId, findOrCreateDummyRecord } from '@tupaia/database';
import { expect } from 'chai';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

const rollbackRecords = async (models, projectCode) => {
  await models.project.delete({ code: projectCode });
  await models.dashboard.delete({ root_entity_code: projectCode });
  const projectEntity = await models.entity.findOne({ code: projectCode, type: 'project' });
  if (projectEntity !== null) {
    await models.entityRelation.delete({ parent_id: projectEntity.id });
    await models.entity.delete({ id: projectEntity.id });
  }
  await models.entityHierarchy.delete({ name: projectCode });
};

describe('Creating a project', async () => {
  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
  };

  const TUPAIA_ADMIN_POLICY = {
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
  };

  const TEST_COUNTRY_ID = generateId();
  const TEST_MAP_OVERLAY_ID = generateId();

  const TEST_PROJECT_INPUT = {
    code: 'test_project_new',
    name: 'test_name',
    countries: [TEST_COUNTRY_ID],
    permission_groups: ['test_group1'],
    description: 'This is a test description',
    sort_order: 3,
    image_url: 'www.image.com',
    logo_url: 'www.image.com',
    entityTypes: ['country'],
    dashboard_group_name: 'test_dashboard',
    default_measure: TEST_MAP_OVERLAY_ID,
  };

  const app = new TestableApp();
  const { models } = app;

  before(async () => {
    await models.country.delete({ code: 'DL' });
    await models.mapOverlay.delete({ code: '126' });
    await findOrCreateDummyRecord(models.entity, { code: 'World' });
    await findOrCreateDummyRecord(models.country, { id: TEST_COUNTRY_ID, code: 'DL' });
    await findOrCreateDummyRecord(models.entity, { code: 'DL' });
    await findOrCreateDummyRecord(models.entity, { code: 'test_project' });
    await findOrCreateDummyRecord(models.project, { code: 'test_project' });
    await findOrCreateDummyRecord(models.permissionGroup, { name: 'test_group1' });
    await findOrCreateDummyRecord(models.mapOverlay, { id: TEST_MAP_OVERLAY_ID, code: '126' });
  });

  afterEach(async () => {
    await rollbackRecords(models, 'test_project_new');
    app.revokeAccess();
  });

  describe('POST /projects', async () => {
    describe('New record validation', async () => {
      it('Throws an error when the project code already exists', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        const code = 'test_project';

        const { body: result } = await app.post('projects', {
          body: {
            ...TEST_PROJECT_INPUT,
            code,
          },
        });

        expect(result).to.deep.equal({
          error: `Invalid content for field "code" causing message "Another project record already exists with with code: ${code}"`,
        });
      });

      it('Throws an error when a non-existent country is included', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        const OTHER_COUNTRY_ID = generateId();

        const { body: result } = await app.post('projects', {
          body: {
            ...TEST_PROJECT_INPUT,
            countries: [OTHER_COUNTRY_ID],
          },
        });

        expect(result).to.deep.equal({
          error:
            'Invalid content for field "countries" causing message "One or more provided countries do not exist"',
        });
      });

      it('Throws an error when there is a non-existent permission group included', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        const { body: result } = await app.post('projects', {
          body: {
            ...TEST_PROJECT_INPUT,
            permission_groups: ['test_group1', 'test_group2'],
          },
        });

        expect(result).to.deep.equal({
          error:
            'Invalid content for field "permission_groups" causing message "Some provided permission groups do not exist"',
        });
      });

      it('Throws an error when the entity types include a non-existent type', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        const { body: result } = await app.post('projects', {
          body: {
            ...TEST_PROJECT_INPUT,
            entityTypes: ['country', 'office'],
          },
        });

        expect(result).to.deep.equal({
          error:
            'Invalid content for field "entityTypes" causing message "Some provided entity types do not exist"',
        });
      });
    });

    it('Throws an error when the user does not have BES Admin permission', async () => {
      await app.grantAccess(TUPAIA_ADMIN_POLICY);

      const { body: result } = await app.post('projects', {
        body: {
          ...TEST_PROJECT_INPUT,
        },
      });

      expect(result).to.deep.equal({
        error: 'You need BES Admin to create new projects',
      });
    });

    describe('Record creation', async () => {
      it('creates a valid project record', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);

        await app.post('projects', {
          body: {
            ...TEST_PROJECT_INPUT,
          },
        });

        const result = await models.project.find({ code: TEST_PROJECT_INPUT.code });
        expect(result.length).to.equal(1);
        expect(result[0].description).to.equal(TEST_PROJECT_INPUT.description);
      });

      it('creates a valid entity record', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);

        await app.post('projects', {
          body: {
            ...TEST_PROJECT_INPUT,
          },
        });

        const result = await models.entity.find({ name: TEST_PROJECT_INPUT.name, type: 'project' });
        expect(result.length).to.equal(1);
        expect(result[0].code).to.equal(TEST_PROJECT_INPUT.code);
      });

      it('creates a valid entity hierarchy record', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);

        await app.post('projects', {
          body: {
            ...TEST_PROJECT_INPUT,
          },
        });

        const result = await models.entityHierarchy.find({ name: TEST_PROJECT_INPUT.code });
        expect(result.length).to.equal(1);
        expect(result[0].name).to.equal(TEST_PROJECT_INPUT.code);
      });
    });
  });
});
