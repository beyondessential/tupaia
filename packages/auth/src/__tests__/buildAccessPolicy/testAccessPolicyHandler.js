import { AccessPolicy as AccessPolicyParser } from '@tupaia/access-policy';
import { upsertDummyRecord, findOrCreateDummyRecord } from '@tupaia/database';
import { buildAccessPolicy } from '../../buildAccessPolicy';
import { setUp } from './helpers';

export const testAccessPolicyHandler = () => {
  let accessPolicy;

  beforeAll(async () => {
    const { models, user, permissionGroups } = await setUp();

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
      permission_group_id: permissionGroups.public.id,
    });

    await upsertDummyRecord(models.userEntityPermission, {
      user_id: user.id,
      entity_id: ottawa.id,
      permission_group_id: permissionGroups.public.id,
    });

    accessPolicy = await buildAccessPolicy(models, user.id);
  });

  describe('check permissions', () => {
    const testData = [
      ['should have Mount Sinai admin permissions', 'CA_OT_TO_MS', ['Public']],
      ['should have Ottawa admin permissions', 'CA_OT_OT', ['Public']],
      ['should not have Toronto permissions', 'CA_OT_TO', undefined],
      ['should not have Canada country level permissions', 'CA', undefined],
    ];

    it.each(testData)('%s', (_, entity, expected) => {
      expect(accessPolicy[entity]).toEqual(expected);
    });
  });

  // integration test
  describe('can be interpreted by our access policy parser', () => {
    let parser;

    beforeAll(() => {
      parser = new AccessPolicyParser(accessPolicy);
    });

    it('individual checks', () => {
      const testData = [
        [['CA_OT_TO_MS', undefined], true],
        [['CA_OT_TO_MS', 'Public'], true],
        [['CA_OT_OT', 'Public'], true],
        [['CA_OT_TO', 'Public'], false],
        [['CA', 'Public'], false],
      ];
      testData.forEach(([[entity, permissionGroup], expected]) => {
        expect(parser.allows(entity, permissionGroup)).toBe(expected);
      });
    });

    it('groups of entities', () => {
      const testData = [
        [[['CA_OT_TO', 'CA_OT_TO_MS', 'CA'], undefined], true],
        [[['CA_OT_TO', 'CA_OT_TO_MS', 'CA'], 'Public'], true],
        [[['CA_OT_TO', 'CA'], undefined], false],
        [[['CA_OT_TO', 'CA'], 'Public'], false],
      ];
      testData.forEach(([[entity, permissionGroup], expected]) => {
        expect(parser.allowsSome(entity, permissionGroup)).toBe(expected);
      });
    });
  });
};
