/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { PermissionsError } from '@tupaia/utils';
import { Route as BaseRoute } from '@tupaia/server-boilerplate';

import { LesmisSessionType } from '../models';
import { MeditrakConnection, ReportConnection } from '../connections';
import { LESMIS_PERMISSION_GROUP } from '../constants';

export class Route extends BaseRoute {
  meditrakConnection?: MeditrakConnection;

  reportConnection?: ReportConnection;

  async handle() {
    // All routes will be wrapped with an error catcher that simply passes the error to the next()
    // function, causing error handling middleware to be fired. Otherwise, async errors will be
    // swallowed.
    try {
      const session = await this.verifyAuth();
      this.meditrakConnection = new MeditrakConnection(session);
      this.reportConnection = new ReportConnection(session);
      const response = await this.buildResponse();
      this.respond(response, 200);
    } catch (error) {
      this.next(error);
    }
  }

  async verifyAuth(): Promise<LesmisSessionType> {
    const session = await this.getSession();
    const { accessPolicy } = session;
    const authorized = accessPolicy.allowsAnywhere(LESMIS_PERMISSION_GROUP);
    if (!authorized) {
      throw new PermissionsError('User not authorized for Lesmis');
    }

    return session;
  }
}
