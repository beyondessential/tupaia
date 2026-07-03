import { upsertDummyRecord, findOrCreateDummyRecord } from '@tupaia/database';
import { buildAccessPolicy } from '../../buildAccessPolicy';
import { setUp } from './helpers';

export const testAsAdminUser = () => {
  let accessPolicy;

  beforeAll(async () => {
    const { models, user, entities, permissionGroups } = await setUp();
    const tonga = await findOrCreateDummyRecord(models.entity, { code: 'TO' }, { name: 'Tonga' });

    await upsertDummyRecord(models.userEntityPermission, {
      user_id: user.id,
      entity_id: entities.demoLand.id,
      permission_group_id: permissionGroups.public.id,
    });
    await upsertDummyRecord(models.userEntityPermission, {
      user_id: user.id,
      entity_id: tonga.id,
      permission_group_id: permissionGroups.admin.id,
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
};
