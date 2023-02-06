/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { findOrCreateDummyRecord } from '@tupaia/database';
import { expect } from 'chai';
import { TestableApp, resetTestData } from '../../testUtilities';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';

describe('Edit a project', async () => {
  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
  };

  const TUPAIA_ADMIN_POLICY = {
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;

  beforeEach(async () => {
    const hierarchyRecord = await findOrCreateDummyRecord(models.entityHierarchy, {
      name: 'test_project',
      canonical_types: `{facility,country}`,
    });
    await findOrCreateDummyRecord(models.project, {
      code: 'test_project',
      entity_hierarchy_id: hierarchyRecord.id,
    });
  });

  afterEach(async () => {
    await resetTestData();
    app.revokeAccess();
  });

  describe('PUT /projects', async () => {
    it('changes the canonical types for a project', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const projectRecord = await models.project.findOne({ code: 'test_project' });
      await app.put(`projects/${projectRecord.id}`, {
        body: {
          'entity_hierarchy.canonical_types': '{village, country}',
        },
      });

      const hierarchyRecord = await models.entityHierarchy.findOne({ name: 'test_project' });

      expect(hierarchyRecord.canonical_types).to.deep.equal(['village', 'country']);
    });

    it('returns an error without BES Admin permission', async () => {
      await app.grantAccess(TUPAIA_ADMIN_POLICY);
      const projectRecord = await models.project.findOne({ code: 'test_project' });
      const record = await app.put(`projects/${projectRecord.id}`, {
        body: {
          'entity_hierarchy.canonical_types': '{village, country}',
        },
      });

      expect(record).to.include.keys(['error']);
    });

    it('changes the canonical types for a project and the project description', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const projectRecord = await models.project.findOne({ code: 'test_project' });
      await app.put(`projects/${projectRecord.id}`, {
        body: {
          'entity_hierarchy.canonical_types': '{village, country}',
          description: 'This is a new test description',
        },
      });

      const projectUpdatedRecord = await models.project.findOne({ code: 'test_project' });
      const hierarchyRecord = await models.entityHierarchy.findOne({ name: 'test_project' });

      expect(projectUpdatedRecord.description).to.equal('This is a new test description');
      expect(hierarchyRecord.canonical_types).to.deep.equal(['village', 'country']);
    });
  });
});
