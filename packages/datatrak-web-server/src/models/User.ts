/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import {
  UserModel as BaseUserModel,
  UserType as BaseUserType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { UserAccount, NullableKeysToOptional } from '@tupaia/types';

export interface UserType extends UserAccount, Omit<BaseUserType, 'id'> {
  getData: () => Promise<NullableKeysToOptional<UserAccount>>;
}

export interface UserModel extends Model<BaseUserModel, UserAccount, UserType> {}
