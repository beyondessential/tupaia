import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { findOrCreateDummyRecord, findOrCreateDummyCountryEntity } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe('Permissions checker for DeleteDashboardItems', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
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
  let dashboardDL;
  let dashboardLA;
  let dashboardSB;
  let dashboardKI;
  let dashboardItemDLPublic;
  let dashboardItemDLPublicLAAdmin;
  let dashboardItemDLPublicSBAdmin;
  let dashboardItemKIAdmin;

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

  describe('DELETE /dashboardItems/:id', async () => {
    describe('Insufficient permissions', async () => {
      it('Throw an exception if we do not have BES admin', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.delete(`dashboardItems/${dashboardItemDLPublic.id}`);

        expect(result).to.have.keys('error');
      });
    });

    describe('Sufficient permissions', async () => {
      it('Allow deleting of dashboard items if we have BES admin access in any country, regardless of country permissions', async () => {
        const preDelete = await models.dashboardItem.findById(dashboardItemDLPublicLAAdmin.id);
        await app.grantAccess(BES_ADMIN_POLICY);
        await app.delete(`dashboardItems/${dashboardItemDLPublicLAAdmin.id}`);
        const result = await models.dashboardItem.findById(dashboardItemDLPublicLAAdmin.id);

        expect(preDelete).to.exist;
        expect(result).to.not.exist;
      });
    });
  });
});
