/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicyBuilder } from '../AccessPolicyBuilder';
import { buildAccessPolicy } from '../buildAccessPolicy';
import { buildLegacyAccessPolicy } from '../buildLegacyAccessPolicy';

jest.mock('../buildAccessPolicy');
jest.mock('../buildLegacyAccessPolicy');

describe('AccessPolicyBuilder', () => {
  let notifyPermissionsChange;
  let notifyPermissionGroupChange;
  const models = {
    userEntityPermission: {
      addChangeHandler: onPermissionsChanged => {
        notifyPermissionsChange = userId =>
          onPermissionsChanged({
            old_record: { user_id: userId },
            new_record: { user_id: userId },
          });
      },
    },
    permissionGroup: {
      addChangeHandler: onPermissionGroupChanged => {
        notifyPermissionGroupChange = () => onPermissionGroupChanged();
      },
    },
  };
  const userId = 'xxx';
  let buildAccessPolicyMock = buildAccessPolicy.mockResolvedValue({});
  let buildLegacyAccessPolicyMock = buildLegacyAccessPolicy.mockResolvedValue({});

  it('throws error when userId is undefined', () => {
    const builder = new AccessPolicyBuilder(models);
    return expect(builder.getPolicyForUser(undefined)).rejects.toEqual(
      new Error('Error building access policy for userId: undefined'),
    );
  });

  describe('selecting modern vs. legacy builder', () => {
    const testData = [
      [
        'builds a modern access policy by default',
        [undefined, [buildAccessPolicyMock, buildLegacyAccessPolicyMock]],
      ],
      [
        'builds a modern access policy when useLegacyFormat is set to false',
        [false, [buildAccessPolicyMock, buildLegacyAccessPolicyMock]],
      ],
      [
        'builds a legacy access policy when useLegacyFormat is set to true',
        [true, [buildLegacyAccessPolicyMock, buildAccessPolicyMock]],
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
});
