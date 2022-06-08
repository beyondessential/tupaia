/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { UserModel as BaseUserModel, UserType as BaseUserType } from '@tupaia/database';
import { Model } from './types';

export type UserFields = Readonly<{
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  gender: string | null;
  employer: string | null;
  position: string | null;
  mobile_number: string | null;
  password_hash: string | null;
  password_salt: string | null;
  verified_email: 'new_user' | 'verified';
  profile_image: string | null;
  primary_platform: 'tupaia' | 'lesmis';
}>;

export interface UserType extends UserFields, Omit<BaseUserType, 'id'> {}

export interface UserModel extends Model<BaseUserModel, UserFields, BaseUserType> {}
