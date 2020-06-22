/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
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

  before(() => {
    sinon.stub(BuildAccessPolicy, 'buildAccessPolicy').resolves();
    sinon.stub(BuildLegacyAccessPolicy, 'buildLegacyAccessPolicy').resolves();
  });

  after(() => {
    BuildAccessPolicy.buildAccessPolicy.restore();
    BuildLegacyAccessPolicy.buildLegacyAccessPolicy.restore();
  });

  afterEach(() => {
    BuildAccessPolicy.buildAccessPolicy.resetHistory();
    BuildLegacyAccessPolicy.buildLegacyAccessPolicy.resetHistory();
  });

  describe('selecting modern vs. legacy builder', () => {
    it('builds a modern access policy by default', async () => {
      const builder = new AccessPolicyBuilder(models);
      await builder.getPolicyForUser(userId);
      expect(BuildAccessPolicy.buildAccessPolicy).to.have.been.calledOnceWithExactly(
        models,
        userId,
      );
      expect(BuildLegacyAccessPolicy.buildLegacyAccessPolicy).not.to.have.been.called;
    });

    it('builds a modern access policy when useLegacyFormat is set to false', async () => {
      const builder = new AccessPolicyBuilder(models);
      await builder.getPolicyForUser(userId, false);
      expect(BuildAccessPolicy.buildAccessPolicy).to.have.been.calledOnceWithExactly(
        models,
        userId,
      );
      expect(BuildLegacyAccessPolicy.buildLegacyAccessPolicy).not.to.have.been.called;
    });

    it('builds a legacy access policy when useLegacyFormat is set to true', async () => {
      const builder = new AccessPolicyBuilder(models);
      await builder.getPolicyForUser(userId, true);
      expect(BuildAccessPolicy.buildAccessPolicy).not.to.have.been.called;
      expect(BuildLegacyAccessPolicy.buildLegacyAccessPolicy).to.have.been.calledOnceWithExactly(
        models,
        userId,
      );
    });
  });

  describe('handles caching and cache invalidation', () => {
    it('avoids rebuilding the policy for the same user', async () => {
      const builder = new AccessPolicyBuilder(models);
      await builder.getPolicyForUser(userId);
      await builder.getPolicyForUser(userId);
      expect(BuildAccessPolicy.buildAccessPolicy).to.have.been.calledOnce;
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
      expect(BuildAccessPolicy.buildAccessPolicy).to.have.been.calledThrice;
    });

    it('does rebuild if there is a change to user entity permissions', async () => {
      const builder = new AccessPolicyBuilder(models);
      await builder.getPolicyForUser(userId); // built once
      await builder.getPolicyForUser(userId); // just fetched
      notifyPermissionsChange(userId); // cache invalidated
      await builder.getPolicyForUser(userId); // built a second time
      expect(BuildAccessPolicy.buildAccessPolicy).to.have.been.calledTwice;
    });
  });
});
