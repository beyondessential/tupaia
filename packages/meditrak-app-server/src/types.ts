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
  UserModel,
  OptionModel,
  FacilityModel,
  CountryModel,
  GeographicalAreaModel,
  PermissionGroupModel,
  SurveyGroupModel,
  SurveyScreenModel,
  SurveyScreenComponentModel,
} from '@tupaia/database';
import { FeedItemModel, MeditrakSyncQueueModel, SurveyModel, SurveyResponseModel } from './models';

export type RequestContext = {
  services: TupaiaApiClient;
};

export interface MeditrakAppServerModelRegistry extends ModelRegistry {
  readonly entity: EntityModel;
  readonly country: CountryModel;
  readonly facility: FacilityModel;
  readonly feedItem: FeedItemModel;
  readonly geographicalArea: GeographicalAreaModel;
  readonly meditrakSyncQueue: MeditrakSyncQueueModel;
  readonly option: OptionModel;
  readonly optionSet: OptionSetModel;
  readonly permissionGroup: PermissionGroupModel;
  readonly question: QuestionModel;
  readonly survey: SurveyModel;
  readonly surveyGroup: SurveyGroupModel;
  readonly surveyScreen: SurveyScreenModel;
  readonly surveyScreenComponent: SurveyScreenComponentModel;
  readonly surveyResponse: SurveyResponseModel;
  readonly user: UserModel;
}
