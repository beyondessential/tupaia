/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { createUser as createUserAccessor } from '../../../dataAccessors';
import { getModels } from '../../getModels';

const models = getModels();

export async function addBaselineTestData() {
  // if there's a pre-existing Demo Land in the DB, use that, otherwise create
  // one with a test ID so it'll get cleaned up later
  const country = await models.country.findOrCreate(
    {
      code: 'DL',
    },
    {
      id: 'demo_land_000000000_test',
      name: 'Demo Land',
    },
  );
  console.log('found demo land', country.code, country.id, country.name);

  const areaId = '1111111111111111111_test';
  await models.geographicalArea.updateOrCreate(
    {
      id: areaId,
    },
    {
      name: 'Test District',
      level_code: 'district',
      level_name: 'District',
      country_id: country.id,
    },
  );

  const adminGroup = await models.permissionGroup.findOrCreate(
    {
      name: 'Admin',
    },
    {
      id: 'admin_0000000000000_test',
    },
  );

  const donorGroup = await models.permissionGroup.findOrCreate(
    {
      name: 'Donor',
    },
    {
      id: 'donor_0000000000000_test',
      parent_id: adminGroup.id,
    },
  );

  await models.permissionGroup.findOrCreate(
    {
      name: 'Public',
    },
    {
      id: 'public_000000000000_test',
      parent_id: donorGroup.id,
    },
  );

  try {
    await createUserAccessor(models, {
      emailAddress: 'test.user@tupaia.org',
      password: 'test.password',
      firstName: 'Test',
      lastName: 'User',
      employer: 'Automation',
      position: 'Test',
      contactNumber: '',
      countryName: 'Demo Land',
      permissionGroupName: 'Admin',
      verifiedEmail: 'verified',
    });
  } catch (e) {
    console.log(e.message, country.code, country.name);
    throw e;
  }
}
