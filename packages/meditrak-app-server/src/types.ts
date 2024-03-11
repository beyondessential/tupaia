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

export interface MeditrakAppServerModelRegistry extends ServerBoilerplateModelRegistry {
  readonly meditrakSyncQueue: MeditrakSyncQueueModel;
}
