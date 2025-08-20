import {
  FeedItemModel as BaseFeedItemModel,
  FeedItemRecord as BaseFeedItemRecord,
} from '@tupaia/database';
import { FeedItem } from '../types/models';
import { Model } from './types';
import { NullableKeysToOptional } from '../utils';

export interface FeedItemRecord extends FeedItem, Omit<BaseFeedItemRecord, 'creation_date'> {
  getData: () => Promise<NullableKeysToOptional<FeedItem>>;
}

export interface FeedItemModel extends Model<BaseFeedItemModel, FeedItem, FeedItemRecord> {}
