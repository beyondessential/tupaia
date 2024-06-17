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

  describe('handles caching and cache invalidation', () => {
    beforeEach(() => {
      buildAccessPolicyMock = buildAccessPolicy.mockResolvedValue({});
      buildLegacyAccessPolicyMock = buildLegacyAccessPolicy.mockResolvedValue({});
    });

    it('does not cache the policy if the response throws an error', async () => {
      buildAccessPolicyMock = buildAccessPolicy.mockRejectedValue(
        new Error('Could not build access policy'),
      );

      const builder = new AccessPolicyBuilder(models);
      try {
        await builder.getPolicyForUser(userId); // built once
      } catch (error) {
        // Error expected
      }

      try {
        await builder.getPolicyForUser(userId); // built second time since it fails to build
      } catch (error) {
        // Error expected
      }

      expect(buildAccessPolicyMock).toHaveBeenCalledTimes(2);
    });

    it('avoids rebuilding the policy for the same user', async () => {
      const builder = new AccessPolicyBuilder(models);
      await builder.getPolicyForUser(userId);
      await builder.getPolicyForUser(userId);
      expect(buildAccessPolicyMock).toHaveBeenCalledTimes(1);
    });

    it('avoids rebuilding the policy for multiple users', async () => {
      const builder = new AccessPolicyBuilder(models);
      const userIds = ['aaa', 'bbb', 'ccc'];
      // build each user's policy once
      for (let i = 0; i < userIds.length; i++) {
        await builder.getPolicyForUser(userIds[i]);
      }
      // and now fetch each of them again
      for (let i = 0; i < userIds.length; i++) {
        await builder.getPolicyForUser(userIds[i]);
      }
      // finally, a couple of extra fetches for luck
      await builder.getPolicyForUser(userIds[2]);
      await builder.getPolicyForUser(userIds[0]);
      expect(buildAccessPolicyMock).toHaveBeenCalledTimes(3);
    });

    it('does rebuild if there is a change to user entity permissions', async () => {
      const builder = new AccessPolicyBuilder(models);
      await builder.getPolicyForUser(userId); // built once
      await builder.getPolicyForUser(userId); // just fetched
      notifyPermissionsChange(userId); // cache invalidated
      await builder.getPolicyForUser(userId); // built a second time
      expect(buildAccessPolicyMock).toHaveBeenCalledTimes(2);
    });

    it('does rebuild if there is a change to permission groups', async () => {
      const builder = new AccessPolicyBuilder(models);
      await builder.getPolicyForUser(userId); // built once
      await builder.getPolicyForUser(userId); // just fetched
      notifyPermissionGroupChange(); // cache invalidated
      await builder.getPolicyForUser(userId); // built a second time
      expect(buildAccessPolicyMock).toHaveBeenCalledTimes(2);
    });
  });
});
