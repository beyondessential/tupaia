import {
  UserCountryAccessAttemptModel as BaseUserCountryAccessAttemptModel,
  UserCountryAccessAttemptRecord as BaseUserCountryAccessAttemptRecord,
} from '@tupaia/database';
import { UserCountryAccessAttempt } from '../types/models';
import { NullableKeysToOptional } from '../utils';
import { Model } from './types';

export interface UserCountryAccessAttemptRecord
  extends UserCountryAccessAttempt,
    BaseUserCountryAccessAttemptRecord {
  getData: () => Promise<NullableKeysToOptional<UserCountryAccessAttempt>>;
}

export interface UserCountryAccessAttemptModel
  extends Model<
    BaseUserCountryAccessAttemptModel,
    UserCountryAccessAttempt,
    UserCountryAccessAttemptRecord
  > {}
