/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { findOrCreateDummyRecord, generateId } from '@tupaia/database';
import { expect } from 'chai';
import { TestableApp } from '../../testUtilities';
import { BES_ADMIN_PERMISSION_GROUP } from '../../../permissions';

const rollbackRecords = async (models, projectCode) => {
  await models.project.delete({ code: projectCode });
  const projectEntity = await models.entity.findOne({ code: projectCode, type: 'project' });

  // Delete project
  if (projectEntity !== null) {
    await models.entityRelation.delete({ parent_id: projectEntity.id });
    await models.entity.delete({ id: projectEntity.id });
  }

  // Delete Fiji
  await models.entity.delete({ code: 'FIJI' });
  await models.country.delete({ code: 'FIJI' });

  // Delete demo land
  await models.entity.delete({ code: 'DL' });
  await models.country.delete({ code: 'DL' });

  await models.entityHierarchy.delete({ name: projectCode });
};
describe('Editing a Project', async () => {
  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
  };
  const app = new TestableApp();
  const { models } = app;

  const PROJECT_ID = generateId();

  const DEMO_LAND = {
    id: generateId(),
    code: 'DL',
  };

  const FIJI = {
    id: generateId(),
    code: 'FIJI',
  };

  const TEST_PROJECT_INPUT = {
    id: PROJECT_ID,
    code: 'test_project',
    description: 'This is a test description',
    sort_order: 3,
    image_url: 'www.image.com',
    logo_url: 'www.image.com',
    dashboard_group_name: 'test_dashboard',
  };

  before(async () => {
    await rollbackRecords(models, 'test_project');

    // Entity Hierarchy
    const entityHierarchy = await findOrCreateDummyRecord(models.entityHierarchy, {
      name: TEST_PROJECT_INPUT.code,
    });

    // Project
    const projectEntity = await findOrCreateDummyRecord(models.entity, {
      code: TEST_PROJECT_INPUT.code,
      type: 'project',
    });
    await findOrCreateDummyRecord(models.project, {
      ...TEST_PROJECT_INPUT,
      entity_id: projectEntity.id,
      entity_hierarchy_id: entityHierarchy.id,
    });

    // Fiji
    await findOrCreateDummyRecord(models.country, { id: FIJI.id, code: FIJI.code });
    const fijiEntity = await findOrCreateDummyRecord(models.entity, {
      code: FIJI.code,
      type: 'country',
    });
    await findOrCreateDummyRecord(models.entityRelation, {
      parent_id: projectEntity.id,
      child_id: fijiEntity.id,
      entity_hierarchy_id: entityHierarchy.id,
    });

    // Demo land
    await findOrCreateDummyRecord(models.country, { id: DEMO_LAND.id, code: DEMO_LAND.code });
    await findOrCreateDummyRecord(models.entity, { code: DEMO_LAND.code, type: 'country' });
  });

  afterEach(async () => {
    app.revokeAccess();
  });

  after(async () => {
    await rollbackRecords(models, 'test_project');
  });

  describe('PUT /projects', async () => {
    it('Updates core project fields', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      await app.put(`projects/${PROJECT_ID}`, {
        body: {
          description: 'Something else',
        },
      });

      const project = await models.project.findById(PROJECT_ID);
      expect(project.description).to.equal('Something else');
    });

    it('Adds countries to a project', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      await app.put(`projects/${PROJECT_ID}`, {
        body: {
          countries: [DEMO_LAND.id, FIJI.id],
        },
      });
      const project = await models.project.findById(PROJECT_ID);
      const relations = await models.entityRelation.find({
        parent_id: project.entity_id,
        entity_hierarchy_id: project.entity_hierarchy_id,
      });
      expect(relations.length).to.equal(2);
    });

    it('Removes countries from a project', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      await app.put(`projects/${PROJECT_ID}`, {
        body: {
          countries: [],
        },
      });
      const project = await models.project.findById(PROJECT_ID);
      const relations = await models.entityRelation.find({
        parent_id: project.entity_id,
        entity_hierarchy_id: project.entity_hierarchy_id,
      });
      expect(relations.length).to.equal(0);
    });
  });
});
