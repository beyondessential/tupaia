import {
  FeedItemModel as BaseFeedItemModel,
  FeedItemRecord as BaseFeedItemRecord,
} from '@tupaia/database';
import { FeedItem, NullableKeysToOptional } from '@tupaia/types';
import { Model } from './types';

export interface FeedItemRecord extends FeedItem, Omit<BaseFeedItemRecord, 'creation_date'> {
  getData: () => Promise<NullableKeysToOptional<FeedItem>>;
}

export interface FeedItemModel extends Model<BaseFeedItemModel, FeedItem, FeedItemRecord> {}
