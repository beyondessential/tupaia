import { upsertDummyRecord } from '@tupaia/database';
import { buildAccessPolicy } from '../../buildAccessPolicy';
import { setUp } from './helpers';

export const testAsPublicUser = () => {
  let accessPolicy;

  beforeAll(async () => {
    const { models, user, entities, permissionGroups } = await setUp();

    await upsertDummyRecord(models.userEntityPermission, {
      entity_id: entities.demoLand.id,
      user_id: user.id,
      permission_group_id: permissionGroups.public.id,
    });
    accessPolicy = await buildAccessPolicy(models, user.id);
  });

  it('should only have access to demo land', () => {
    expect(accessPolicy.DL).toStrictEqual(['Public']);
    expect(Object.keys(accessPolicy).length).toBe(1);
  });
};
