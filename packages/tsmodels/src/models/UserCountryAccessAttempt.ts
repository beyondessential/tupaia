import {
  UserCountryAccessAttemptModel as BaseModel,
  UserCountryAccessAttemptRecord as BaseRecord,
} from '@tupaia/database';
import { UserCountryAccessAttempt, NullableKeysToOptional } from '@tupaia/types';
import { Model } from './types';

export interface UserCountryAccessAttemptRecord extends UserCountryAccessAttempt, BaseRecord {
  getData: () => Promise<NullableKeysToOptional<UserCountryAccessAttempt>>;
}

export interface UserCountryAccessAttemptModel
  extends Model<BaseModel, UserCountryAccessAttempt, UserCountryAccessAttemptRecord> {}
