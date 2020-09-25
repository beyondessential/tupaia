import { upsertDummyRecord, findOrCreateDummyRecord } from '@tupaia/database';
import { Demo } from './setup';
import { buildAccessPolicy } from '../../buildAccessPolicy';

export const testAsAdminUser = () => {
  let accessPolicy;

  beforeAll(async () => {
    const user = await upsertDummyRecord(Demo.models.user);
    const tonga = await findOrCreateDummyRecord(
      Demo.models.entity,
      { code: 'TO' },
      { name: 'Tonga' },
    );

    await upsertDummyRecord(Demo.models.userEntityPermission, {
      user_id: user.id,
      entity_id: Demo.demoLand.id,
      permission_group_id: Demo.publicPermission.id,
    });
    await upsertDummyRecord(Demo.models.userEntityPermission, {
      user_id: user.id,
      entity_id: tonga.id,
      permission_group_id: Demo.adminPermission.id,
    });

    accessPolicy = await buildAccessPolicy(Demo.models, user.id);
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
