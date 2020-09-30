/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable no-underscore-dangle */

import { expect } from 'chai';
import { hasAccess } from '@beyondessential/tupaia-access-policy';
import {
  clearTestData,
  getTestDatabase,
  getTestModels,
  upsertDummyRecord,
  findOrCreateDummyRecord,
} from '@tupaia/database';
import { buildLegacyAccessPolicy } from '../buildLegacyAccessPolicy';

describe('buildLegacyAccessPolicy', () => {
  const models = getTestModels();
  let demoLand;
  let adminPermission;
  let publicPermission;

  before(async () => {
    await clearTestData(getTestDatabase());

    demoLand = await findOrCreateDummyRecord(
      models.entity,
      { code: 'DL' },
      { name: 'Demo Land', type: 'country' },
    );

    adminPermission = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });
    const donorPermission = await findOrCreateDummyRecord(
      models.permissionGroup,
      {
        name: 'Donor',
      },
      {
        parent_id: adminPermission.id,
      },
    );
    publicPermission = await findOrCreateDummyRecord(
      models.permissionGroup,
      {
        name: 'Public',
      },
      {
        parent_id: donorPermission.id,
      },
    );
  });

  describe('Demo Land public user', () => {
    let accessPolicy;

    before(async () => {
      const user = await upsertDummyRecord(models.user);
      await upsertDummyRecord(models.userEntityPermission, {
        entity_id: demoLand.id,
        user_id: user.id,
        permission_group_id: publicPermission.id,
      });
      accessPolicy = await buildLegacyAccessPolicy(models, user.id);
    });

    it('should only have access to demo land', () => {
      const surveyPermissionItems = accessPolicy.permissions.surveys._items;
      expect(surveyPermissionItems.DL._access.Public).to.equal(true);
      expect(Object.values(surveyPermissionItems).length).to.equal(1);
    });

    it('should be interpreted correctly by the legacy parser', () => {
      const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['DL'], 'Public');
      expect(hasAccessPolicyAccess).to.equal(true);
    });
  });

  describe('Tonga admin user', () => {
    let accessPolicy;

    before(async () => {
      const user = await upsertDummyRecord(models.user);
      const tonga = await findOrCreateDummyRecord(
        models.entity,
        { code: 'TO' },
        { name: 'Tonga', type: 'country' },
      );

      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: demoLand.id,
        permission_group_id: publicPermission.id,
      });
      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: tonga.id,
        permission_group_id: adminPermission.id,
      });

      accessPolicy = await buildLegacyAccessPolicy(models, user.id);
    });

    it('should have Demo Land public access, as interpreted by legacy parser', () => {
      expect(hasAccess(accessPolicy, 'surveys', ['DL'], 'Public')).to.equal(true);
      expect(hasAccess(accessPolicy, 'surveys', ['DL'], 'Donor')).to.equal(false);
      expect(hasAccess(accessPolicy, 'surveys', ['DL'], 'Admin')).to.equal(false);
    });

    it('should have Tonga admin, donor, and public access, as interpreted by legacy parser', () => {
      expect(hasAccess(accessPolicy, 'surveys', ['TO'], 'Public')).to.equal(true);
      expect(hasAccess(accessPolicy, 'surveys', ['TO'], 'Donor')).to.equal(true);
      expect(hasAccess(accessPolicy, 'surveys', ['TO'], 'Admin')).to.equal(true);
    });

    it('should have no access to other entities', () => {
      const surveyPermissionItems = accessPolicy.permissions.surveys._items;
      expect(Object.values(surveyPermissionItems).length).to.equal(2); // DL and TO only
    });
  });

  describe('Ignores any permissions lower than country level', () => {
    let accessPolicy;

    before(async () => {
      const user = await upsertDummyRecord(models.user);

      // Create a facility nested deep within a new country
      const canada = await findOrCreateDummyRecord(
        models.entity,
        {
          code: 'CA',
        },
        {
          name: 'Canada',
          type: 'country',
        },
      );

      const ontario = await findOrCreateDummyRecord(
        models.entity,
        {
          code: 'CA_OT',
        },
        {
          name: 'Ontario',
          country_code: canada.code,
          parent_id: canada.id,
          type: 'district',
        },
      );

      const ottawa = await findOrCreateDummyRecord(
        models.entity,
        {
          code: 'CA_OT_OT',
        },
        {
          name: 'Ottawa',
          country_code: canada.code,
          parent_id: ontario.id,
          type: 'district',
        },
      );

      const toronto = await findOrCreateDummyRecord(
        models.entity,
        {
          name: 'Toronto',
        },
        {
          code: 'CA_OT_TO',
          country_code: canada.code,
          parent_id: ontario.id,
          type: 'district',
        },
      );

      const mountSinai = await findOrCreateDummyRecord(
        models.entity,
        {
          code: 'CA_OT_TO_MS',
        },
        {
          name: 'Mount Sinaia Hospital',
          country_code: canada.code,
          parent_id: toronto.id,
          type: 'facility',
        },
      );

      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: mountSinai.id,
        permission_group_id: publicPermission.id,
      });

      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: ottawa.id,
        permission_group_id: publicPermission.id,
      });

      accessPolicy = await buildLegacyAccessPolicy(models, user.id);
    });

    it('should not have any permissions', () => {
      const surveyPermissionItems = accessPolicy.permissions.surveys._items;
      expect(Object.values(surveyPermissionItems).length).to.equal(0);
    });

    it('should not have Mount Sinai admin permissions', () => {
      const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['CA_OT_TO_MS'], 'Public');
      expect(hasAccessPolicyAccess).to.equal(false);
    });

    it('should not have Ottawa admin permissions', () => {
      const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['CA_OT_OT'], 'Public');
      expect(hasAccessPolicyAccess).to.equal(false);
    });

    it('should not have Toronto permissions', () => {
      const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['CA_OT_TO'], 'Public');
      expect(hasAccessPolicyAccess).to.equal(false);
    });

    it('should not have Canada country level permissions', () => {
      const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['CA'], 'Public');
      expect(hasAccessPolicyAccess).to.equal(false);
    });
  });
});
