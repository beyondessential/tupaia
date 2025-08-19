import {
  UserCountryAccessAttemptModel as BaseModel,
  UserCountryAccessAttemptRecord as BaseRecord,
} from '@tupaia/database';
import { UserCountryAccessAttempt } from '../models';
import { NullableKeysToOptional } from '../../utils';
import { Model } from './types';

export interface UserCountryAccessAttemptRecord extends UserCountryAccessAttempt, BaseRecord {
  getData: () => Promise<NullableKeysToOptional<UserCountryAccessAttempt>>;
}

export interface UserCountryAccessAttemptModel
  extends Model<BaseModel, UserCountryAccessAttempt, UserCountryAccessAttemptRecord> {}
