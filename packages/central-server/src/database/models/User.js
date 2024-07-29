/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { UserRecord as CommonUserRecord, UserModel as CommonUserModel } from '@tupaia/database';

// Currently our pattern is that session tables don't have models
// in the generic database package, this is a quick and dirty way to get
// context for them into central-server
// TODO: Move sessions into database and clean this up
const SERVICES = {
  // admin_panel: 'admin_panel_session',
  // datatrak_web: 'datatrak_web_session',
  tupaia_web: 'tupaia_web_session',
};

class UserRecord extends CommonUserRecord {
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
  meditrakConfig = {
    // only sync id and first and last name
    ignorableFields: [
      'email',
      'gender',
      'creation_date',
      'employer',
      'position',
      'mobile_number',
      'password_hash',
      'password_salt',
      'verified_email',
      'profile_image',
      'primary_platform',
      'preferences',
    ],
    translateRecordForSync: record => {
      return {
        id: record.id,
        // create full name from first and last name
        full_name: [record.first_name, record.last_name].filter(name => !!name).join(' '),
      };
    },
    minAppVersion: '1.14.142',
  };

  get DatabaseRecordClass() {
    return UserRecord;
  }
}
