/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { findOrCreateDummyRecord, generateId } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe("Editing an entity's name", async () => {
  const BES_ADMIN_POLICY = {
    SB: [BES_ADMIN_PERMISSION_GROUP],
  };

  const TUPAIA_ADMIN_POLICY = {
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;

  const ENTITY = {
    code: 'test_entity',
    id: generateId(),
    name: 'original_name',
  };
  before(async () => {
    await findOrCreateDummyRecord(models.entity, ENTITY);
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('PUT /entities/:id', async () => {
    it('Successfully changes the entity name', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      await app.put(`entities/${ENTITY.id}`, {
        body: { name: 'new_name' },
      });

      const result = await models.entity.find({ id: ENTITY.id, name: 'new_name' });
      expect(result.length).to.equal(1);
      expect(result[0].name).to.equal('new_name');
    });

    it('Throws an exception if we do not have BES admin access', async () => {
      await app.grantAccess(TUPAIA_ADMIN_POLICY);
      const { body: result } = await app.put(`entities/${ENTITY.id}`, {
        body: { name: 'new_name' },
      });

      expect(result).to.deep.equal({ error: 'Need BES Admin access' });
    });
  });
});
