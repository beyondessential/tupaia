/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';
import {
  ModelRegistry,
  EntityModel,
  OptionSetModel,
  QuestionModel,
  SurveyModel,
  UserModel,
} from '@tupaia/database';
import { FeedItemModel, MeditrakSyncQueueModel } from './models';

export type RequestContext = {
  services: TupaiaApiClient;
};

export interface MeditrakAppServerModelRegistry extends ModelRegistry {
  readonly entity: EntityModel;
  readonly feedItem: FeedItemModel;
  readonly meditrakSyncQueue: MeditrakSyncQueueModel;
  readonly optionSet: OptionSetModel;
  readonly question: QuestionModel;
  readonly survey: SurveyModel;
  readonly user: UserModel;
}
