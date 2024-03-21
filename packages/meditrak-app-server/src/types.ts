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

type Models =
  | 'dataElement'
  | 'user'
  | 'surveyResponse'
  | 'answer'
  | 'feedItem'
  | 'database'
  | 'question'
  | 'country'
  | 'facility'
  | 'entity'
  | 'survey'
  | 'permissionGroup'
  | 'option'
  | 'geographicalArea'
  | 'optionSet'
  | 'surveyGroup'
  | 'surveyScreen'
  | 'surveyScreenComponent'
  | 'getModelNameForDatabaseRecord';

export interface MeditrakAppServerModelRegistry
  extends Pick<ServerBoilerplateModelRegistry, Models> {
  readonly meditrakSyncQueue: MeditrakSyncQueueModel;
}
