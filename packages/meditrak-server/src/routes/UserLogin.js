/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Authenticator, getAuthorizationObject } from '@tupaia/auth';
import { respond, PermissionsError } from '@tupaia/utils';
import { AccessPolicy } from '@tupaia/access-policy';

import { RouteHandler } from './RouteHandler';
import { allowNoPermissions, hasTupaiaAdminPanelAccess } from '../permissions';
import { AdminPanelSession } from '../database/models';

/**
 * Handles POST endpoint for logging in Admin Panel:
 * - /login
 */

export class UserLogin extends RouteHandler {
  constructor(req, res) {
    super(req, res);
    this.sessionModel = new AdminPanelSession(this.req.database);
  }

  async assertUserHasAccess() {
    await this.assertPermissions(allowNoPermissions);
  }

  async handleRequest() {
    const authenticator = new Authenticator(this.models);
    const { refreshToken, user, accessPolicy } = await authenticator.authenticatePassword(
      this.req.body,
    );

    if (!hasTupaiaAdminPanelAccess(new AccessPolicy(accessPolicy))) {
      throw new PermissionsError('User not authorized for Admin Panel');
    }

    const { accessToken, user: userDetails } = await getAuthorizationObject({
      refreshToken,
      user,
      accessPolicy,
    });
    const sessionDetails = {
      email: userDetails.email,
      accessToken,
      refreshToken,
      accessPolicy,
    };
    const { id, email } = await this.sessionModel.createSession(sessionDetails);

    this.req.sessionCookie = { id, email };

    respond(this.res, { user: userDetails });
  }
}
