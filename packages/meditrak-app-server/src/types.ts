/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';
import { ModelRegistry } from '@tupaia/database';
import { FeedItemModel } from './models';

export type RequestContext = {
  services: TupaiaApiClient;
};

export interface MeditrakAppServerModelRegistry extends ModelRegistry {
  readonly feedItem: FeedItemModel;
}
