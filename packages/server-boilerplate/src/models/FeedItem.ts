/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  FeedItemModel as BaseFeedItemModel,
  FeedItemType as BaseFeedItemType,
} from '@tupaia/database';
import { FeedItem, NullableKeysToOptional } from '@tupaia/types';
import { Model } from './types';

export interface FeedItemType extends FeedItem, Omit<BaseFeedItemType, 'creation_date'> {
  getData: () => Promise<NullableKeysToOptional<FeedItem>>;
}

export interface FeedItemModel extends Model<BaseFeedItemModel, FeedItem, FeedItemType> {}
