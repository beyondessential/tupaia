import { expect } from 'chai';
import { findOrCreateDummyRecord } from '@tupaia/database';
import { BES_ADMIN_PERMISSION_GROUP, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';
import { TestableApp } from '../../testUtilities';

const BES_ADMIN_POLICY = { DL: [BES_ADMIN_PERMISSION_GROUP] };
const NON_BES_ADMIN_POLICY = { DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP] };

const TEST_PROJECT_CODE = 'create_country_test';
const NEW_COUNTRY = { code: 'ZZ', name: 'Zedland' };

describe('CreateCountry: POST /countries', () => {
  const app = new TestableApp();
  const { models } = app;
  let project;

  const cleanup = async () => {
    const entity = await models.entity.findOne({ code: NEW_COUNTRY.code, type: 'country' });
    if (entity) {
      if (project) await models.projectCountry.delete({ country_id: entity.id });
      await models.entity.delete({ id: entity.id });
    }
    await models.country.delete({ code: NEW_COUNTRY.code });
  };

  before(async () => {
    await findOrCreateDummyRecord(models.entity, { code: 'World', type: 'world' });
    project = await findOrCreateDummyRecord(models.project, { code: TEST_PROJECT_CODE });
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

  it('links the new country to the active project when projectCode is supplied', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const response = await app
      .post('countries', { body: NEW_COUNTRY })
      .query({ projectCode: TEST_PROJECT_CODE });
    expect(response.statusCode).to.equal(200);

    const entity = await models.entity.findOne({ code: NEW_COUNTRY.code, type: 'country' });
    const link = await models.projectCountry.findOne({
      project_id: project.id,
      country_id: entity.id,
    });
    expect(link).to.exist;
  });

  it('creates no project_country link when no projectCode is supplied', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    await app.post('countries', { body: NEW_COUNTRY });

    const entity = await models.entity.findOne({ code: NEW_COUNTRY.code, type: 'country' });
    const link = await models.projectCountry.findOne({ country_id: entity.id });
    expect(link).to.not.exist;
  });
});
