import { expect } from 'chai';
import { findOrCreateDummyRecord } from '@tupaia/database';
import { BES_ADMIN_PERMISSION_GROUP, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';
import { TestableApp } from '../../testUtilities';

const BES_ADMIN_POLICY = { DL: [BES_ADMIN_PERMISSION_GROUP] };
const NON_BES_ADMIN_POLICY = { DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP] };

const NEW_COUNTRY = { code: 'ZZ', name: 'Zedland' };

describe('CreateCountry: POST /countries', () => {
  const app = new TestableApp();
  const { models } = app;

  const cleanup = async () => {
    const entity = await models.entity.findOne({ code: NEW_COUNTRY.code, type: 'country' });
    if (entity) {
      await models.projectCountry.delete({ country_id: entity.id });
      await models.entity.delete({ id: entity.id });
    }
    await models.country.delete({ code: NEW_COUNTRY.code });
  };

  before(async () => {
    await findOrCreateDummyRecord(models.entity, { code: 'World', type: 'world' });
    await cleanup();
  });

  afterEach(async () => {
    await cleanup();
    app.revokeAccess();
  });

  it('rejects a non-BES-Admin', async () => {
    await app.grantAccess(NON_BES_ADMIN_POLICY);
    const response = await app.post('countries', { body: NEW_COUNTRY });
    expect(response.statusCode).to.not.equal(200);
    const country = await models.country.findOne({ code: NEW_COUNTRY.code });
    expect(country).to.not.exist;
  });

  it('creates the country row and a matching shared country entity parented to World', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const response = await app.post('countries', { body: NEW_COUNTRY });
    expect(response.statusCode).to.equal(200);

    const country = await models.country.findOne({ code: NEW_COUNTRY.code });
    expect(country).to.exist;

    const entity = await models.entity.findOne({ code: NEW_COUNTRY.code, type: 'country' });
    expect(entity).to.exist;
    expect(entity.project_id).to.equal(null);
    const world = await models.entity.findOne({ type: 'world' });
    expect(entity.parent_id).to.equal(world.id);
  });

  it('does not link the new country to any project (Countries tab is all-projects)', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    await app.post('countries', { body: NEW_COUNTRY });

    const entity = await models.entity.findOne({ code: NEW_COUNTRY.code, type: 'country' });
    const link = await models.projectCountry.findOne({ country_id: entity.id });
    expect(link).to.not.exist;
  });
});
