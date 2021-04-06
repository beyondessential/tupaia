/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { PermissionsError } from '@tupaia/utils';
import { LoginRoute as BaseLoginRoute } from '@tupaia/server-boilerplate';

import { LESMIS_PERMISSION_GROUP } from '../constants';

export class LoginRoute extends BaseLoginRoute {
  verifyLoginAuth(accessPolicy) {
    const authorized = accessPolicy.allowsAnywhere(LESMIS_PERMISSION_GROUP);
    if (!authorized) {
      throw new PermissionsError('User not authorized for Lesmis');
    }
  }
}
