/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import {
  FeedItemModel as BaseFeedItemModel,
  FeedItemRecord as BaseFeedItemRecord,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { FeedItem, NullableKeysToOptional } from '@tupaia/types';

export interface FeedItemRecord extends FeedItem, Omit<BaseFeedItemRecord, 'id' | 'creation_date'> {
  getData: () => Promise<NullableKeysToOptional<FeedItem>>;
}

export interface FeedItemModel extends Model<BaseFeedItemModel, FeedItem, FeedItemRecord> {}
