/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicyBuilder } from '../AccessPolicyBuilder';
import * as BuildAccessPolicy from '../buildAccessPolicy';
import * as BuildLegacyAccessPolicy from '../buildLegacyAccessPolicy';

describe('AccessPolicyBuilder', () => {
  let notifyPermissionsChange;
  const models = {
    userEntityPermission: {
      addChangeHandler: onPermissionsChanged => {
        notifyPermissionsChange = userId => onPermissionsChanged({ record: { user_id: userId } });
      },
    },
  };
  let spyOnBuildAccessPolicy;
  let spyOnBuildLegacyAccessPolicy;
  const userId = 'xxx';

  beforeAll(() => {
    spyOnBuildAccessPolicy = jest.spyOn(BuildAccessPolicy, 'buildAccessPolicy');
    spyOnBuildLegacyAccessPolicy = jest.spyOn(BuildLegacyAccessPolicy, 'buildLegacyAccessPolicy');
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe.only('selecting modern vs. legacy builder', () => {
    const testData = [
      [
        'builds a modern access policy by default',
        [null, [spyOnBuildAccessPolicy, spyOnBuildLegacyAccessPolicy]],
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
        builder.getPolicyForUser(userId, useLegacyFormat).then(_ => {
          expect(policyToBeCalled).toHaveBeenCalledWith(models, userId);
          expect(policyNotToBeCalled).not.toHaveBeenCalled();
        });
      },
    );
  });

  describe('handles caching and cache invalidation', () => {
    it('avoids rebuilding the policy for the same user', async () => {
      try {
        const builder = new AccessPolicyBuilder(models);
        await builder.getPolicyForUser(userId);
        await builder.getPolicyForUser(userId);
        expect(spyOnBuildAccessPolicy).toHaveBeenCalledTimes(1);
      } catch (e) {}
    });

    it('avoids rebuilding the policy for multiple users', async () => {
      try {
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
      } catch (e) {}
    });

    it('does rebuild if there is a change to user entity permissions', async () => {
      try {
        const builder = new AccessPolicyBuilder(models);
        await builder.getPolicyForUser(userId); // built once
        await builder.getPolicyForUser(userId); // just fetched
        notifyPermissionsChange(userId); // cache invalidated
        await builder.getPolicyForUser(userId); // built a second time
        expect(spyOnBuildAccessPolicy).toHaveBeenCalledTimes(2);
      } catch (e) {}
    });
  });
});
