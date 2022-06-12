/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry, modelClasses } from '@tupaia/database';

export interface TestModelRegistry extends ModelRegistry {
  readonly dataElement: modelClasses.DataElement;
  readonly feedItem: modelClasses.FeedItem;
  readonly meditrakSyncQueue: modelClasses.MeditrakSyncQueue;
  readonly user: modelClasses.User;
  readonly question: modelClasses.Question;
}
