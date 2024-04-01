/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { UserModel as BaseUserModel, UserRecord as BaseUserRecord } from '@tupaia/database';
import { UserAccount, NullableKeysToOptional } from '@tupaia/types';
import { Model } from './types';

export interface UserRecord extends UserAccount, BaseUserRecord {
  getData: () => Promise<NullableKeysToOptional<UserAccount>>;
}

export interface UserModel extends Model<BaseUserModel, UserAccount, UserRecord> {}
