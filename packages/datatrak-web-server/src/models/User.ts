/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { UserModel as BaseUserModel, UserRecord as BaseUserRecord } from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { UserAccount, NullableKeysToOptional } from '@tupaia/types';

export interface UserRecord extends UserAccount, Omit<BaseUserRecord, 'id'> {
  getData: () => Promise<NullableKeysToOptional<UserAccount>>;
}

export interface UserModel extends Model<BaseUserModel, UserAccount, UserRecord> {}
