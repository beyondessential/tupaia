import {
  OneTimeLoginModel as BaseOneTimeLoginModel,
  OneTimeLoginRecord as BaseOneTimeLoginRecord,
} from '@tupaia/database';
import { OneTimeLogin } from '@tupaia/types';
import { Model } from './types';

export interface OneTimeLoginRecord extends OneTimeLogin, BaseOneTimeLoginRecord {}

export interface OneTimeLoginModel
  extends Model<BaseOneTimeLoginModel, OneTimeLogin, OneTimeLoginRecord> {}
