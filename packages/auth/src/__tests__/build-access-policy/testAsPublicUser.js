import { upsertDummyRecord } from '@tupaia/database';
import { Demo } from './setup';
import { buildAccessPolicy } from '../../buildAccessPolicy';

export const testAsPublicUser = () => {
  let accessPolicy;

  beforeAll(async () => {
    const user = await upsertDummyRecord(Demo.models.user);
    await upsertDummyRecord(Demo.models.userEntityPermission, {
      entity_id: Demo.demoLand.id,
      user_id: user.id,
      permission_group_id: Demo.publicPermission.id,
    });
    accessPolicy = await buildAccessPolicy(Demo.models, user.id);
  });

  it('should only have access to demo land', () => {
    expect(accessPolicy.DL).toStrictEqual(['Public']);
    expect(Object.keys(accessPolicy).length).toBe(1);
  });
};
