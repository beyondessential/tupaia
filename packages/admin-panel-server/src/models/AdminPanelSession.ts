/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { SessionRecord, SessionModel } from '@tupaia/server-boilerplate';

export class AdminPanelSessionRecord extends SessionRecord {
  public static databaseRecord = 'admin_panel_session';
}

export class AdminPanelSessionModel extends SessionModel {
  public get DatabaseRecordClass() {
    return AdminPanelSessionRecord;
  }
}
