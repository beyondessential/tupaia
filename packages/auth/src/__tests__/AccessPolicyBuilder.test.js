/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicyBuilder } from '../AccessPolicyBuilder';
import { buildAccessPolicy } from '../buildAccessPolicy';

jest.mock('../buildAccessPolicy');

describe('AccessPolicyBuilder', () => {
  const models = {};
  const userId = 'xxx';
  let buildAccessPolicyMock = buildAccessPolicy.mockResolvedValue({});

  it('throws error when userId is undefined', () => {
    const builder = new AccessPolicyBuilder(models);
    return expect(builder.getPolicyForUser(undefined)).rejects.toEqual(
      new Error('Error building access policy for userId: undefined'),
    );
  });

  it('builds an access policy', async () => {
    const builder = new AccessPolicyBuilder(models);
    await builder.getPolicyForUser(userId);
    expect(buildAccessPolicyMock).toHaveBeenCalledOnceWith(models, userId);
  });
});
