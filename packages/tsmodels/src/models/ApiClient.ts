import {
  ApiClientModel as BaseApiClientModel,
  ApiClientRecord as BaseApiClientRecord,
} from '@tupaia/database';
import { ApiClient } from '@tupaia/types';
import { Model } from './types';

export interface ApiClientRecord extends ApiClient, BaseApiClientRecord {}

export interface ApiClientModel extends Model<BaseApiClientModel, ApiClient, ApiClientRecord> {}
