import { UserModel as BaseUserModel, UserRecord as BaseUserRecord } from '@tupaia/database';
import { UserAccount } from '@tupaia/types';
import { NullableKeysToOptional } from '../utils';
import { Model } from './types';

export interface UserRecord extends UserAccount, BaseUserRecord {
  getData: () => Promise<NullableKeysToOptional<UserAccount>>;
  full_name: string;
}

export interface UserModel extends Model<BaseUserModel, UserAccount, UserRecord> {}
