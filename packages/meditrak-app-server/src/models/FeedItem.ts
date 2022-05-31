/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  FeedItemModel as BaseFeedItemModel,
  FeedItemType as BaseFeedItemType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { NullableKeysToOptional } from '@tupaia/tsutils';

export type FeedItemFields = Readonly<{
  id: string;
  country_id: string | null;
  geographical_area_id: string | null;
  user_id: string | null;
  permission_group_id: string | null;
  type: string;
  record_id: string | null;
  template_variables: Record<string, any>;
  creation_date: string;
}>;

export interface FeedItemType
  extends FeedItemFields,
    Omit<BaseFeedItemType, 'id' | 'creation_date'> {
  getData: () => Promise<NullableKeysToOptional<FeedItemFields>>;
}

export interface FeedItemModel extends Model<BaseFeedItemModel, FeedItemFields, FeedItemType> {}
