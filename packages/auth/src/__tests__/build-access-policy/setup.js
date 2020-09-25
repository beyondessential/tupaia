/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  clearTestData,
  getTestDatabase,
  findOrCreateDummyRecord,
  ModelRegistry,
} from '@tupaia/database';

export const Demo = {
  models: undefined,
  demoLand: undefined,
  adminPermission: undefined,
  publicPermission: undefined,
  initialise: async () => {
    Demo.models = new ModelRegistry(getTestDatabase());

    await clearTestData(getTestDatabase());

    Demo.demoLand = await findOrCreateDummyRecord(
      Demo.models.entity,
      { code: 'DL' },
      { name: 'Demo Land' },
    );

    Demo.adminPermission = await findOrCreateDummyRecord(Demo.models.permissionGroup, {
      name: 'Admin',
    });
    const donorPermission = await findOrCreateDummyRecord(
      Demo.models.permissionGroup,
      {
        name: 'Donor',
      },
      {
        parent_id: Demo.adminPermission.id,
      },
    );

    Demo.publicPermission = await findOrCreateDummyRecord(
      Demo.models.permissionGroup,
      {
        name: 'Public',
      },
      {
        parent_id: donorPermission.id,
      },
    );
  },
};
