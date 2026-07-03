import {
  findOrCreateDummyRecord,
  getTestDatabase,
  ModelRegistry,
  upsertDummyRecord,
} from '@tupaia/database';

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
