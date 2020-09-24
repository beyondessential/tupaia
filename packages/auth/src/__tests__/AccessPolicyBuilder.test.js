/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import sinon from 'sinon';
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
  const userId = 'xxx';
  let spyOnBuildAccessPolicy;
  let spyOnBuildLegacyAccessPolicy;
  beforeAll(() => {
    spyOnBuildAccessPolicy = jest.spyOn(BuildAccessPolicy, 'buildAccessPolicy');
    spyOnBuildLegacyAccessPolicy = jest.spyOn(BuildLegacyAccessPolicy, 'buildLegacyAccessPolicy');
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    BuildAccessPolicy.buildAccessPolicy.resetHistory();
    BuildLegacyAccessPolicy.buildLegacyAccessPolicy.resetHistory();
  });

  describe('selecting modern vs. legacy builder', () => {
    it('builds a modern access policy by default', async () => {
      const builder = new AccessPolicyBuilder(models);
      await builder.getPolicyForUser(userId);
      expect(spyOnBuildAccessPolicy).toHaveBeenCalledWith(models, userId);
      expect(spyOnBuildLegacyAccessPolicy).not.toHaveBeenCalled();
    });

    it('builds a modern access policy when useLegacyFormat is set to false', async () => {
      const builder = new AccessPolicyBuilder(models);
      await builder.getPolicyForUser(userId, false);
      expect(spyOnBuildAccessPolicy).toHaveBeenCalledWith(models, userId);
      expect(spyOnBuildLegacyAccessPolicy).not.toHaveBeenCalled();
    });

    it('builds a legacy access policy when useLegacyFormat is set to true', async () => {
      const builder = new AccessPolicyBuilder(models);
      await builder.getPolicyForUser(userId, true);
      expect(spyOnBuildAccessPolicy).not.toHaveBeenCalled();
      expect(spyOnBuildLegacyAccessPolicy).toHaveBeenCalledWith(models, userId);
    });
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
