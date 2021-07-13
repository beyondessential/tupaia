/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';

import { RouteHandler } from './RouteHandler';
import { allowNoPermissions } from '../permissions';
import { AdminPanelSession } from '../database/models';
/**
 * Handles POST endpoint for logging out Admin Panel:
 * - /logout
 */

export class UserLogout extends RouteHandler {
  constructor(req, res) {
    super(req, res);
    this.sessionModel = new AdminPanelSession(this.req.database);
  }

  async assertUserHasAccess() {
    await this.assertPermissions(allowNoPermissions);
  }

  async handleRequest() {
    const { sessionCookie } = this.req;
    const sessionId = sessionCookie?.id;

    if (sessionId) {
      await this.sessionModel.deleteById(sessionId);
    }

    if (sessionCookie) {
      sessionCookie.reset();
    }

    respond(this.res, { success: true });
  }
}
