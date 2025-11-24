import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { findOrCreateDummyRecord, findOrCreateDummyCountryEntity } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
  VIZ_BUILDER_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe('EditDashboardItems', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public', TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, VIZ_BUILDER_PERMISSION_GROUP],
    KI: ['Admin', VIZ_BUILDER_PERMISSION_GROUP],
    SB: ['Royal Australasian College of Surgeons'],
    VU: ['Admin'],
    LA: ['Admin'],
    TO: ['Admin'],
  };

  const BES_ADMIN_POLICY = {
    SB: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let dashboardDL;
  let dashboardLA;
  let dashboardSB;
  let dashboardKI;
  let dashboardItemDLPublic;
  let dashboardItemDLPublicLAAdmin;
  let dashboardItemDLPublicSBAdmin;
  let dashboardItemKIAdmin;
  let reportKIAdmin;
  let legacyDashboardItemKIAdmin;

  before(async () => {
    const publicPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Public',
    });

    const adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });

    const { entity: laosEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'LA',
    });

    const { entity: solomonEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'SB',
    });

    const { entity: kiribatiEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'KI',
    });

    const { entity: demoEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'DL',
    });

    // Create test data
    dashboardDL = await findOrCreateDummyRecord(models.dashboard, {
      code: 'DL_PKMN',
      name: 'Pokemon',
      root_entity_code: demoEntity.code,
    });
    dashboardLA = await findOrCreateDummyRecord(models.dashboard, {
      code: 'LA_PKMN',
      name: 'Pokemon',
      root_entity_code: laosEntity.code,
    });
    dashboardSB = await findOrCreateDummyRecord(models.dashboard, {
      code: 'SB_PKMN',
      name: 'Pokemon',
      root_entity_code: solomonEntity.code,
    });
    dashboardKI = await findOrCreateDummyRecord(models.dashboard, {
      code: 'KI_PKMN',
      name: 'Pokemon',
      root_entity_code: kiribatiEntity.code,
    });
    dashboardItemDLPublic = await findOrCreateDummyRecord(models.dashboardItem, {
      code: 'NUM_PKMN',
      report_code: 'NUM_PKMN',
      config: { name: 'Number of Pokemon' },
      legacy: false,
    });
    dashboardItemDLPublicLAAdmin = await findOrCreateDummyRecord(models.dashboardItem, {
      code: 'LOC_PKMN',
      report_code: 'LOC_PKMN',
      config: { name: 'Locations of Pokemon' },
      legacy: false,
    });
    dashboardItemDLPublicSBAdmin = await findOrCreateDummyRecord(models.dashboardItem, {
      code: 'RARE_PKMN',
      report_code: 'RARE_PKMN',
      config: { name: 'Rarity of Pokemon' },
      legacy: false,
    });
    dashboardItemKIAdmin = await findOrCreateDummyRecord(models.dashboardItem, {
      code: 'FAV_PKMN',
      report_code: 'FAV_PKMN',
      config: { name: 'Favourite Pokemon' },
      legacy: false,
    });

    legacyDashboardItemKIAdmin = await findOrCreateDummyRecord(models.dashboardItem, {
      code: 'LEGACY_FAV_PKMN',
      report_code: 'LEGACY_FAV_PKMN',
      config: { name: 'Favourite Pokemon' },
      legacy: true,
    });

    reportKIAdmin = await findOrCreateDummyRecord(models.report, {
      code: 'ALT_FAV_PKMN',
      permission_group_id: publicPermissionGroup.id,
      config: {},
    });

    // Give the test users some permissions
    await findOrCreateDummyRecord(models.dashboardRelation, {
      dashboard_id: dashboardDL.id,
      child_id: dashboardItemDLPublic.id,
      entity_types: '{country}',
      project_codes: '{explore}',
      permission_groups: `{${publicPermissionGroup.name}}`,
    });
    await findOrCreateDummyRecord(models.dashboardRelation, {
      dashboard_id: dashboardDL.id,
      child_id: dashboardItemDLPublicLAAdmin.id,
      entity_types: '{country}',
      project_codes: '{explore}',
      permission_groups: `{${publicPermissionGroup.name}}`,
    });
    await findOrCreateDummyRecord(models.dashboardRelation, {
      dashboard_id: dashboardLA.id,
      child_id: dashboardItemDLPublicLAAdmin.id,
      entity_types: '{country}',
      project_codes: '{explore}',
      permission_groups: `{${adminPermissionGroup.name}}`,
    });
    await findOrCreateDummyRecord(models.dashboardRelation, {
      dashboard_id: dashboardDL.id,
      child_id: dashboardItemDLPublicSBAdmin.id,
      entity_types: '{country}',
      project_codes: '{explore}',
      permission_groups: `{${publicPermissionGroup.name}}`,
    });
    await findOrCreateDummyRecord(models.dashboardRelation, {
      dashboard_id: dashboardSB.id,
      child_id: dashboardItemDLPublicSBAdmin.id,
      entity_types: '{country}',
      project_codes: '{explore}',
      permission_groups: `{${adminPermissionGroup.name}}`,
    });
    await findOrCreateDummyRecord(models.dashboardRelation, {
      dashboard_id: dashboardKI.id,
      child_id: dashboardItemKIAdmin.id,
      entity_types: '{country}',
      project_codes: '{explore}',
      permission_groups: `{${adminPermissionGroup.name}}`,
    });
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('PUT /dashboardItems/:id', async () => {
    describe('Insufficient permissions', async () => {
      it('Throw an exception if we do not have BES admin or Tupaia Admin panel access anywhere', async () => {
        const policy = {
          DL: ['Public'],
        };
        await app.grantAccess(policy);
        const { body: result } = await app.put(`dashboardItems/${dashboardItemDLPublic.id}`, {
          body: { code: 'no_access' },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw an exception if we do not have admin panel access to any of the root entities', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.put(
          `dashboardItems/${dashboardItemDLPublicLAAdmin.id}`,
          {
            body: { report_code: 'no_admin_panel_access_to_LA' },
          },
        );

        expect(result).to.have.keys('error');
      });

      it('Throw an exception if we do not have sufficient access to any of the root entities', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.put(
          `dashboardItems/${dashboardItemDLPublicSBAdmin.id}`,
          {
            body: { report_code: 'no_admin_access_to_SB' },
          },
        );

        expect(result).to.have.keys('error');
      });
    });

    describe('Sufficient permissions', async () => {
      it('Allow editing of dashboard items if we have access to all the countries the user we are editing has access to', async () => {
        const newName = 'My all time favourite pokemon';
        await app.grantAccess(DEFAULT_POLICY);
        await app.put(`dashboardItems/${dashboardItemKIAdmin.id}`, {
          body: { config: { name: newName } },
        });
        const result = await models.dashboardItem.findById(dashboardItemKIAdmin.id);

        expect(result.config.name).to.equal(newName);
      });

      it('Allow editing of a dashboard item if we have BES admin access in any country, even if the user we are editing does not have access to that country', async () => {
        const newName = 'Where to find cool pokemon';
        await app.grantAccess(BES_ADMIN_POLICY);
        await app.put(`dashboardItems/${dashboardItemDLPublicLAAdmin.id}`, {
          body: { config: { name: newName } },
        });
        const result = await models.dashboardItem.findById(dashboardItemDLPublicLAAdmin.id);

        expect(result.config.name).to.equal(newName);
      });
    });

    describe('Validation', async () => {
      it('Does not allow editing of report_code if it does not match an existing report and the dashboard viz is not a legacy viz', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        await app.put(`dashboardItems/${dashboardItemKIAdmin.id}`, {
          body: { code: 'new code', report_code: 'new code' },
        });
        const result = await models.dashboardItem.findById(dashboardItemKIAdmin.id);
        expect(result.report_code).to.equal(dashboardItemKIAdmin.code);
      });

      it('Allows editing of report_code if it matches an existing report and the dashboard viz is not a legacy viz', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        await app.put(`dashboardItems/${dashboardItemKIAdmin.id}`, {
          body: { code: reportKIAdmin.code, report_code: reportKIAdmin.code },
        });
        const result = await models.dashboardItem.findById(dashboardItemKIAdmin.id);
        expect(result.report_code).to.equal(reportKIAdmin.code);
      });

      it('Allows editing of report_code if it does not match an existing report and the dashboard viz is a legacy viz', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        await app.put(`dashboardItems/${legacyDashboardItemKIAdmin.id}`, {
          body: { code: 'new code', report_code: 'new code' },
        });
        const result = await models.dashboardItem.findById(legacyDashboardItemKIAdmin.id);
        expect(result.report_code).to.equal('new code');
      });
    });
  });
});
