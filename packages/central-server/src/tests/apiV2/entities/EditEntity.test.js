import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
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
    country_code: 'SB',
  };
  before(async () => {
    await findOrCreateDummyRecord(models.entity, ENTITY);
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('PUT /entities/:id', async () => {
    it('Successfully changes the entity name if the user has BES Admin permissions', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      await app.put(`entities/${ENTITY.id}`, {
        body: { name: 'new_name' },
      });

      const result = await models.entity.find({ id: ENTITY.id, name: 'new_name' });
      expect(result.length).to.equal(1);
      expect(result[0].name).to.equal('new_name');
    });

    it('Successfully changes the entity name if the user has Tupaia Admin Panel permissions for the entity country', async () => {
      await app.grantAccess(TUPAIA_ADMIN_POLICY);
      await app.put(`entities/${ENTITY.id}`, {
        body: { name: 'new_name' },
      });

      const result = await models.entity.find({ id: ENTITY.id, name: 'new_name' });
      expect(result.length).to.equal(1);
      expect(result[0].name).to.equal('new_name');
    });

    it('Throws an exception if we do not have Admin access to the country', async () => {
      await app.grantAccess({
        SB: ['Public'],
      });
      const { body: result } = await app.put(`entities/${ENTITY.id}`, {
        body: { name: 'new_name' },
      });

      expect(result).to.deep.equal({
        error:
          "One of the following conditions need to be satisfied:\nNeed BES Admin access\nNeed Tupaia Admin Panel access to country 'SB' to edit entity",
      });
    });
  });
});
