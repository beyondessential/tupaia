/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';
import { ServerBoilerplateModelRegistry } from '@tupaia/server-boilerplate';
import { MeditrakSyncQueueModel } from './models';

export type RequestContext = {
  services: TupaiaApiClient;
};

// this orchestration server uses more models than it excludes, so use an Omit instead of a Pick
type IgnoreModels =
  | 'apiRequestLog'
  | 'apiClient'
  | 'dashboard'
  | 'dashboardItem'
  | 'mapOverlayGroup'
  | 'dashboardMailingListEntry'
  | 'dashboardRelation'
  | 'mapOverlayGroupRelation';

export interface MeditrakAppServerModelRegistry
  extends Omit<ServerBoilerplateModelRegistry, IgnoreModels> {
  readonly meditrakSyncQueue: MeditrakSyncQueueModel;
}
