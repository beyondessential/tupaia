import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { buildAndInsertProjectsAndHierarchies, findOrCreateDummyRecord } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
  VIZ_BUILDER_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp, resetTestData } from '../../testUtilities';

describe('Permissions checker for CreateDashboards', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, VIZ_BUILDER_PERMISSION_GROUP, 'Admin'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
    TO: ['Admin'],
  };

  const BES_ADMIN_POLICY = {
    SB: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;

  before(async () => {
    await resetTestData();

    await buildAndInsertProjectsAndHierarchies(models, [
      {
        code: 'test_project',
        name: 'Test Project',
        entities: [
          { code: 'KI', country_code: 'KI' },
          { code: 'VU', country_code: 'VU' },
          { code: 'TO', country_code: 'TO' },
          { code: 'SB', country_code: 'SB' },
          { code: 'LA', country_code: 'LA' },
        ],
      },
    ]);
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('POST /dashboards', async () => {
    describe('Insufficient permission', async () => {
      it('Throw a permissions gate error if we do not have BES admin or Tupaia Admin panel access anywhere', async () => {
        const policy = {
          DL: ['Public'],
        };
        await app.grantAccess(policy);
        const { body: result } = await app.post(`dashboards`, {
          body: {
            code: 'no_access_anywhere',
            name: 'No access anywhere',
            root_entity_code: 'DL',
          },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw an exception when trying to create a dashboard for an entity we do not have permissions for', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const entityCode = 'TEST_LAND';
        await findOrCreateDummyRecord(models.entity, {
          code: entityCode,
        });
        const { body: result } = await app.post(`dashboards`, {
          body: {
            code: 'no_access_to_entity',
            name: 'No access to Entity',
            root_entity_code: entityCode,
          },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw an exception when trying to create a dashboard to an entity when we lack Tupaia Admin Panel access to that entity', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.post(`dashboards`, {
          body: {
            code: 'no_tupaia_admin_panel_access_to_entity',
            name: 'No Tupaia Admin Panel access to entity',
            root_entity_code: 'TO',
          },
        });

        expect(result).to.have.keys('error');
      });
    });

    describe('Sufficient permission', async () => {
      it('Allow creation of a dashboard for an entity we have permission for', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const code = 'sufficient_permissions';
        const name = 'Sufficient Permissions';
        await app.post(`dashboards`, {
          body: {
            code,
            name,
            root_entity_code: 'KI',
          },
        });
        const result = await models.dashboard.find({
          code,
        });

        expect(result.length).to.equal(1);
        expect(result[0].name).to.equal(name);
      });

      it('Allow creation of a dashboard for Tupaia Admin user', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        const code = 'bes_admin_user';
        const name = 'BES Admin user';
        await app.post(`dashboards`, {
          body: {
            code,
            name,
            root_entity_code: 'KI',
          },
        });
        const result = await models.dashboard.find({
          code,
        });

        expect(result.length).to.equal(1);
        expect(result[0].name).to.equal(name);
      });
    });

    describe('Invalid input', async () => {
      it('Throw a input validation error if we do not have code', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.post(`dashboards`, {
          body: {
            name: 'No code',
            root_entity_code: 'KI',
          },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw a input validation error if we do not have name', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.post(`dashboards`, {
          body: {
            code: 'no_name',
            root_entity_code: 'KI',
          },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw a input validation error if we do not have root_entity_code', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.post(`dashboards`, {
          body: {
            code: 'no_root_entity_code',
            name: 'No root entity code',
          },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw a input validation error if sort_order is not a number', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.post(`dashboards`, {
          body: {
            code: 'sort_order_is_NaN',
            name: 'Sort order is NaN',
            root_entity_code: 'KI',
            sort_order: 'cat',
          },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw a input validation error if dashboard with the same code already exists', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const code = 'same_code_twice';
        const firstName = 'First';
        await app.post(`dashboards`, {
          body: {
            code,
            name: firstName,
            root_entity_code: 'KI',
          },
        });
        const result = await models.dashboard.find({
          code,
        });

        expect(result.length).to.equal(1);
        expect(result[0].name).to.equal(firstName);

        const { body: secondResult } = await app.post(`dashboards`, {
          body: {
            code,
            name: 'Second',
            root_entity_code: 'KI',
          },
        });

        expect(secondResult).to.have.keys('error');
      });
    });

    describe('Valid input', async () => {
      it('Allow creation of a dashboard for an entity we have permission for', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const code = 'valid_input';
        const name = 'Valid Input';
        const rootEntityCode = 'KI';
        await app.post(`dashboards`, {
          body: {
            code,
            name,
            root_entity_code: rootEntityCode,
          },
        });
        const result = await models.dashboard.find({
          code,
        });

        expect(result.length).to.equal(1);
        expect(result[0].name).to.equal(name);
        expect(result[0].root_entity_code).to.equal(rootEntityCode);
      });

      it('Allow creation of dashboard with sort order specified', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        const code = 'has_sort_order';
        const name = 'Has sort order';
        const sortOrder = 7;
        await app.post(`dashboards`, {
          body: {
            code,
            name,
            root_entity_code: 'KI',
            sort_order: sortOrder,
          },
        });
        const result = await models.dashboard.find({
          code,
        });

        expect(result.length).to.equal(1);
        expect(result[0].name).to.equal(name);
        expect(result[0].sort_order).to.equal(sortOrder);
      });
    });
  });
});
