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

  async setupConnections() {
    const session = await this.getSession();
    this.meditrakConnection = new MeditrakConnection(session);
    this.reportConnection = new ReportConnection(session);
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
