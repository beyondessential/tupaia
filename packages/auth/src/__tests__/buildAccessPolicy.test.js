/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy as AccessPolicyParser } from '@tupaia/access-policy';
import {
  clearTestData,
  getTestDatabase,
  upsertDummyRecord,
  findOrCreateDummyRecord,
  ModelRegistry,
} from '@tupaia/database';
import { buildAccessPolicy } from '../buildAccessPolicy';

describe('buildAccessPolicy', () => {
  const models = new ModelRegistry(getTestDatabase());
  let demoLand;
  let adminPermission;
  let publicPermission;

  beforeAll(async () => {
    await clearTestData(getTestDatabase());

    demoLand = await findOrCreateDummyRecord(models.entity, { code: 'DL' }, { name: 'Demo Land' });

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
      accessPolicy = await buildAccessPolicy(models, user.id);
    });

    it('should only have access to demo land', () => {
      expect(accessPolicy.DL).toStrictEqual(['Public']);
      expect(Object.keys(accessPolicy).length).toBe(1);
    });
  });

  describe('Tonga admin user', () => {
    let accessPolicy;

    beforeAll(async () => {
      const user = await upsertDummyRecord(models.user);
      const tonga = await findOrCreateDummyRecord(models.entity, { code: 'TO' }, { name: 'Tonga' });

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

      accessPolicy = await buildAccessPolicy(models, user.id);
    });

    it('should have Demo Land public access', () => {
      expect(accessPolicy.DL).toStrictEqual(['Public']);
    });

    it('should have Tonga admin, donor, and public access', () => {
      expect(accessPolicy.TO).toStrictEqual(expect.arrayContaining(['Public', 'Donor', 'Admin']));
    });

    it('should have no access to other entities', () => {
      expect(Object.values(accessPolicy).length).toBe(2); // DL and TO only
    });
  });

  describe('Handles entities of all types/nesting agnostically', () => {
    let accessPolicy;

    beforeAll(async () => {
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

      accessPolicy = await buildAccessPolicy(models, user.id);
    });

    it('should have Mount Sinai admin permissions', () => {
      const mountSinaiPermissions = accessPolicy.CA_OT_TO_MS;
      expect(mountSinaiPermissions).toEqual(['Public']);
    });

    it('should have Ottawa admin permissions', () => {
      const ottawaPermissions = accessPolicy.CA_OT_OT;
      expect(ottawaPermissions).toEqual(['Public']);
    });

    it('should not have Toronto permissions', () => {
      const torontoPermissions = accessPolicy.CA_OT_TO;
      expect(torontoPermissions).toBeUndefined();
    });

    it('should not have Canada country level permissions', () => {
      const canadaPermissions = accessPolicy.CA;
      expect(canadaPermissions).toBeUndefined();
    });

    // integration test
    it('can be interpreted by our access policy parser', () => {
      const parser = new AccessPolicyParser(accessPolicy);

      // individual checks
      expect(parser.allows('CA_OT_TO_MS')).toBe(true);
      expect(parser.allows('CA_OT_TO_MS', 'Public')).toBe(true);
      expect(parser.allows('CA_OT_OT', 'Public')).toBe(true);
      expect(parser.allows('CA_OT_TO', 'Public')).toBe(false);
      expect(parser.allows('CA', 'Public')).toBe(false);

      // groups of entities
      expect(parser.allowsSome(['CA_OT_TO', 'CA_OT_TO_MS', 'CA'])).toBe(true);
      expect(parser.allowsSome(['CA_OT_TO', 'CA_OT_TO_MS', 'CA'], 'Public')).toBe(true);
      expect(parser.allowsSome(['CA_OT_TO', 'CA'])).toBe(false);
      expect(parser.allowsSome(['CA_OT_TO', 'CA'], 'Public')).toBe(false);
    });
  });
});
