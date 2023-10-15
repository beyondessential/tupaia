/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { UserType as CommonUserType, UserModel as CommonUserModel } from '@tupaia/database';

// Currently our pattern is that session tables don't have models
// in the generic database package, this is a quick and dirty way to get
// context for them into central-server
// TODO: Move sessions into database and clean this up
const SERVICES = {
  // admin_panel: 'admin_panel_session',
  // datatrak_web: 'datatrak_web_session',
  tupaia_web: 'tupaia_web_session',
};

class UserType extends CommonUserType {
  async expireSessionToken(service) {
    if (!SERVICES[service]) {
      throw new Error(`${service} is not a support service for session expiry`);
    }
    await this.database.executeSql(
      `
        UPDATE ?? SET access_token_expiry = 0 WHERE email = ?
      `,
      [SERVICES[service], this.email],
    );
  }
}

export class UserModel extends CommonUserModel {
  get DatabaseTypeClass() {
    return UserType;
  }
}
