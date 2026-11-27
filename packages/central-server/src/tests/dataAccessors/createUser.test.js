import { expect } from 'chai';

import { UnprocessableContentError, randomEmail } from '@tupaia/utils';

import { createUser } from '../../dataAccessors';
import { getModels } from '../testUtilities/database/getModels';

describe('createUser', () => {
  const models = getModels();

  const buildUserFields = () => ({
    firstName: 'Automated test',
    lastName: 'User',
    emailAddress: randomEmail(),
    password: 'password123',
    employer: 'Test',
    position: 'Robot',
    // Baseline test data (see `addBaselineTestData`)
    countryName: 'Demo Land',
    permissionGroupName: 'Admin',
  });

  it('throws an UnprocessableContentError if the permission group does not exist', async () => {
    const userFields = { ...buildUserFields(), permissionGroupName: 'Nonexistent Group' };

    await expect(createUser(models, userFields)).to.be.rejectedWith(
      UnprocessableContentError,
      'No permission group found with name ‘Nonexistent Group’',
    );
    expect(await models.user.findOne({ email: userFields.emailAddress })).to.equal(null);
  });

  it('throws an UnprocessableContentError if the country does not exist', async () => {
    const userFields = { ...buildUserFields(), countryName: 'Nonexistent Land' };

    await expect(createUser(models, userFields)).to.be.rejectedWith(
      UnprocessableContentError,
      'No country found with name ‘Nonexistent Land’',
    );
    expect(await models.user.findOne({ email: userFields.emailAddress })).to.equal(null);
  });
});
