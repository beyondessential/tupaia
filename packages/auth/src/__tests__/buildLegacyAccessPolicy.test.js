/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable no-underscore-dangle */

import { hasAccess } from '@beyondessential/tupaia-access-policy';
import { getTestModels, upsertDummyRecord, findOrCreateDummyRecord } from '@tupaia/database';
import { buildLegacyAccessPolicy } from '../buildLegacyAccessPolicy';

describe('buildLegacyAccessPolicy', () => {
  const models = getTestModels();
  let demoLand;
  let adminPermission;
  let publicPermission;

  beforeAll(async () => {
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

    beforeAll(async () => {
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
      expect(surveyPermissionItems.DL._access.Public).toBe(true);
      expect(Object.values(surveyPermissionItems).length).toBe(1);
    });

    it('should be interpreted correctly by the legacy parser', () => {
      const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['DL'], 'Public');
      expect(hasAccessPolicyAccess).toBe(true);
    });
  });

  describe('Tonga admin user', () => {
    let accessPolicy;

    beforeAll(async () => {
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

    const testData = [
      [
        'should have Demo Land public access, as interpreted by legacy parser',
        [
          [[['DL'], 'Public'], true],
          [[['DL'], 'Donor'], false],
          [[['DL'], 'Admin'], false],
        ],
      ],
      [
        'should have Tonga admin, donor, and public access, as interpreted by legacy parser',
        [
          [[['TO'], 'Public'], true],
          [[['TO'], 'Donor'], true],
          [[['TO'], 'Admin'], true],
        ],
      ],
    ];

    it.each(testData)('%s', (_, testCaseData) => {
      testCaseData.forEach(([[organisationUnitPath, userGroup], expected]) => {
        expect(hasAccess(accessPolicy, 'surveys', organisationUnitPath, userGroup)).toBe(expected);
      });
    });

    it('should have no access to other entities', () => {
      const surveyPermissionItems = accessPolicy.permissions.surveys._items;
      expect(Object.values(surveyPermissionItems).length).toBe(2); // DL and TO only
    });
  });

  describe('Ignores any permissions lower than country level', () => {
    let accessPolicy;

    beforeAll(async () => {
      const user = await upsertDummyRecord(models.user);

      // Create a facility nested deep within a new country
      const greece = await findOrCreateDummyRecord(
        models.entity,
        {
          code: 'GR',
        },
        {
          name: 'Greece',
          type: 'country',
        },
      );

      const attica = await findOrCreateDummyRecord(
        models.entity,
        {
          code: 'GR_AT',
        },
        {
          name: 'Attica',
          country_code: greece.code,
          parent_id: greece.id,
          type: 'district',
        },
      );

      const piraeus = await findOrCreateDummyRecord(
        models.entity,
        {
          code: 'GR_AT_PI',
        },
        {
          name: 'Piraeus',
          country_code: greece.code,
          parent_id: attica.id,
          type: 'district',
        },
      );

      const athens = await findOrCreateDummyRecord(
        models.entity,
        {
          code: 'GR_AT_AT',
        },
        {
          name: 'Athens',
          country_code: greece.code,
          parent_id: attica.id,
          type: 'district',
        },
      );

      const leto = await findOrCreateDummyRecord(
        models.entity,
        {
          code: 'GR_AT_AT_Leto',
        },
        {
          name: 'Leto Hospital',
          country_code: greece.code,
          parent_id: athens.id,
          type: 'facility',
        },
      );

      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: leto.id,
        permission_group_id: publicPermission.id,
      });

      await upsertDummyRecord(models.userEntityPermission, {
        user_id: user.id,
        entity_id: piraeus.id,
        permission_group_id: publicPermission.id,
      });

      accessPolicy = await buildLegacyAccessPolicy(models, user.id);
    });

    const testData = [
      ['should not have Leto admin permissions', [['GR_AT_AT_Leto'], 'Public'], false],
      ['should not have Athens admin permissions', [['GR_AT_AT'], 'Public'], false],
      ['should not have Piraeus permissions', [['GR_AT_PI'], 'Public'], false],
      ['should not have Greece country level permissions', [['CA'], 'Public'], false],
    ];

    it.each(testData)('%s', (_, [organisationUnitPath, userGroup], expected) => {
      expect(hasAccess(accessPolicy, 'surveys', organisationUnitPath, userGroup)).toBe(expected);
    });

    it('should not have any permissions', () => {
      const surveyPermissionItems = accessPolicy.permissions.surveys._items;
      expect(Object.values(surveyPermissionItems).length).toBe(0);
    });
  });
});
