/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { SessionType, SessionModel } from '@tupaia/server-boilerplate';

export class AdminPanelSessionType extends SessionType {
  public static databaseType = 'admin_panel_session';
}

export class AdminPanelSessionModel extends SessionModel {
  public get DatabaseTypeClass() {
    return AdminPanelSessionType;
  }
}
