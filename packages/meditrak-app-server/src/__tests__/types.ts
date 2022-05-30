/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry, FeedItemModel, UserModel } from '@tupaia/database';

export interface TestModelRegistry extends ModelRegistry {
  readonly feedItem: FeedItemModel;
  readonly user: UserModel;
}
