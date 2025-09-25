import { UserRecord as CommonUserRecord, UserModel as CommonUserModel } from '@tupaia/database';

// Internal users who should be flagged in the meditrak app to exclude from user lists
const INTERNAL_USERS = [
  'edmofro@gmail.com', // Edwin
  'kahlinda.mahoney@gmail.com', // Kahlinda
  'lparish1980@gmail.com', // Lewis
  'sus.lake@gmail.com', // Susie
  'michaelnunan@hotmail.com', // Michael
  'vanbeekandrew@gmail.com', // Andrew
  'gerardckelly@gmail.com', // Gerry K
  'geoffreyfisher@hotmail.com', // Geoff F
  'josh@sussol.net', // mSupply API Client
  'unicef.laos.edu@gmail.com', // Laos Schools Data Collector
];

const INTERNAL_EMAIL_REGEXP = /((@bes.au)|(@tupaia.org)|(@beyondessential.com.au))/;

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
    await this.database.executeSql('UPDATE ?? SET access_token_expiry = 0 WHERE email = ?;', [
      SERVICES[service],
      this.email,
    ]);
  }
}

export class UserModel extends CommonUserModel {
  meditrakConfig = {
    // only sync id and first and last name
    ignorableFields: [
      'gender',
      'creation_date',
      'employer',
      'position',
      'mobile_number',
      'password_hash',
      'legacy_password_salt',
      'verified_email',
      'profile_image',
      'primary_platform',
      'preferences',
      'full_name', // ignore this because it isn't a real field, it's a derived field
    ],
    translateRecordForSync: record => {
      const { email, ...restOfRecord } = record;
      const isInternal = INTERNAL_USERS.includes(email) || INTERNAL_EMAIL_REGEXP.test(email);

      // Flag internal users. These will be filtered out in meditrak-app
      if (isInternal) {
        return { ...restOfRecord, internal: true };
      }
      return restOfRecord;
    },
    minAppVersion: '1.14.144',
  };

  get DatabaseRecordClass() {
    return UserRecord;
  }
}
