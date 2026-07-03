import {
  findOrCreateDummyRecord,
  getTestDatabase,
  ModelRegistry,
  upsertDummyRecord,
} from '@tupaia/database';
import { buildAccessPolicy } from '../../buildAccessPolicy';
import { buildAccessPolicyOld } from './buildAccessPolicyOld';

export const expectAccessPoliciesEquivalent = (actual, expected) => {
  expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());
  Object.keys(expected).forEach(entityCode => {
    expect(actual[entityCode].slice().sort()).toEqual(expected[entityCode].slice().sort());
  });
};

export const buildAndCompareAccessPolicies = async (models, userId) => {
  const [accessPolicy, accessPolicyOld] = await Promise.all([
    buildAccessPolicy(models, userId),
    buildAccessPolicyOld(models, userId),
  ]);
  expectAccessPoliciesEquivalent(accessPolicy, accessPolicyOld);
  return accessPolicy;
};

export const setUp = async () => {
  const database = getTestDatabase();
  const models = new ModelRegistry(database);

  const demoLand = await findOrCreateDummyRecord(
    models.entity,
    { code: 'DL' },
    { name: 'Demo Land' },
  );

  const adminPermission = await findOrCreateDummyRecord(models.permissionGroup, {
    name: 'Admin',
  });
  const donorPermission = await findOrCreateDummyRecord(
    models.permissionGroup,
    { name: 'Donor' },
    { parent_id: adminPermission.id },
  );
  const publicPermission = await findOrCreateDummyRecord(
    models.permissionGroup,
    { name: 'Public' },
    { parent_id: donorPermission.id },
  );

  return {
    models,
    user: await upsertDummyRecord(models.user),
    entities: {
      demoLand,
    },
    permissionGroups: {
      admin: adminPermission,
      donor: donorPermission,
      public: publicPermission,
    },
  };
};
