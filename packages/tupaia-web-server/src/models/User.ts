/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { UserModel as BaseUserModel, UserType } from '@tupaia/database';
import { UserAccount } from '@tupaia/types';
import { Model } from '@tupaia/server-boilerplate';

export interface UserModel extends Model<BaseUserModel, UserAccount, UserType> {}
