/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { UserRecord, UserModel as CommonUserModel } from '@tupaia/database';

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

const INTERNAL_EMAIL_REGEX = /((@bes.au)|(@tupaia.org)|(@beyondessential.com.au))/;

/**
 * @description Model for the User table for user_account records for meditrak - this is to differentiate it from the User model which is for the current user, not for syncing user account records
 */
export class UserAccountModel extends CommonUserModel {
  meditrakConfig = {
    // only sync id and first and last name
    ignorableFields: [
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
      'full_name', // ignore this because it isn't a real field, it's a derived field
    ],
    translateRecordForSync: record => {
      const { email, ...restOfRecord } = record;
      const isInternal = INTERNAL_USERS.includes(email) || INTERNAL_EMAIL_REGEX.test(email);

      // Flag internal users. These will be filtered out in meditrak-app
      if (isInternal) {
        return { ...restOfRecord, internal: true };
      }
      return restOfRecord;
    },
    minAppVersion: '1.14.142',
  };

  get DatabaseRecordClass() {
    return UserRecord;
  }
}
