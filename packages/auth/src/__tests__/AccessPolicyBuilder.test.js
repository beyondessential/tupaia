/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicyBuilder } from '../AccessPolicyBuilder';
import { buildAccessPolicy } from '../buildAccessPolicy';
import { buildLegacyAccessPolicy } from '../buildLegacyAccessPolicy';

jest.mock('../buildAccessPolicy');
jest.mock('../buildLegacyAccessPolicy');
const spyOnBuildAccessPolicy = buildAccessPolicy.mockResolvedValue({});
const spyOnBuildLegacyAccessPolicy = buildLegacyAccessPolicy.mockResolvedValue({});

describe('AccessPolicyBuilder', () => {
  let notifyPermissionsChange;
  const models = {
    userEntityPermission: {
      addChangeHandler: onPermissionsChanged => {
        notifyPermissionsChange = userId => onPermissionsChanged({ record: { user_id: userId } });
      },
    },
  };
  const userId = 'xxx';

  describe('selecting modern vs. legacy builder', () => {
    const testData = [
      [
        'builds a modern access policy by default',
        [undefined, [spyOnBuildAccessPolicy, spyOnBuildLegacyAccessPolicy]],
      ],
      [
        'builds a modern access policy when useLegacyFormat is set to false',
        [false, [spyOnBuildAccessPolicy, spyOnBuildLegacyAccessPolicy]],
      ],
      [
        'builds a legacy access policy when useLegacyFormat is set to true',
        [true, [spyOnBuildLegacyAccessPolicy, spyOnBuildAccessPolicy]],
      ],
    ];

    it.each(testData)(
      '%s',
      async (_, [useLegacyFormat, [policyToBeCalled, policyNotToBeCalled]]) => {
        const builder = new AccessPolicyBuilder(models);
        await builder.getPolicyForUser(userId, useLegacyFormat);
        expect(policyToBeCalled).toHaveBeenCalledOnceWith(models, userId);
        expect(policyNotToBeCalled).not.toHaveBeenCalled();
      },
    );
  });

  describe('handles caching and cache invalidation', () => {
    it('avoids rebuilding the policy for the same user', async () => {
      const builder = new AccessPolicyBuilder(models);
      await builder.getPolicyForUser(userId);
      await builder.getPolicyForUser(userId);
      expect(spyOnBuildAccessPolicy).toHaveBeenCalledTimes(1);
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
      expect(spyOnBuildAccessPolicy).toHaveBeenCalledTimes(3);
    });

    it('does rebuild if there is a change to user entity permissions', async () => {
      const builder = new AccessPolicyBuilder(models);
      await builder.getPolicyForUser(userId); // built once
      await builder.getPolicyForUser(userId); // just fetched
      notifyPermissionsChange(userId); // cache invalidated
      await builder.getPolicyForUser(userId); // built a second time
      expect(spyOnBuildAccessPolicy).toHaveBeenCalledTimes(2);
    });
  });
});
