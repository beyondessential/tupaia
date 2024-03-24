/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';
import {
  AnswerModel,
  CountryModel,
  DataElementModel,
  EntityModel,
  FacilityModel,
  FeedItemModel,
  GeographicalAreaModel,
  MeditrakSyncQueueModel,
  OptionModel,
  OptionSetModel,
  PermissionGroupModel,
  QuestionModel,
  SurveyGroupModel,
  SurveyModel,
  SurveyResponseModel,
  SurveyScreenComponentModel,
  SurveyScreenModel,
  UserModel,
} from '@tupaia/server-boilerplate';
import { ModelRegistry } from '@tupaia/database';

export type RequestContext = {
  services: TupaiaApiClient;
};

export interface MeditrakAppServerModelRegistry extends ModelRegistry {
  readonly dataElement: DataElementModel;
  readonly user: UserModel;
  readonly surveyResponse: SurveyResponseModel;
  readonly answer: AnswerModel;
  readonly feedItem: FeedItemModel;
  readonly question: QuestionModel;
  readonly country: CountryModel;
  readonly facility: FacilityModel;
  readonly entity: EntityModel;
  readonly survey: SurveyModel;
  readonly permissionGroup: PermissionGroupModel;
  readonly option: OptionModel;
  readonly geographicalArea: GeographicalAreaModel;
  readonly optionSet: OptionSetModel;
  readonly surveyGroup: SurveyGroupModel;
  readonly surveyScreen: SurveyScreenModel;
  readonly surveyScreenComponent: SurveyScreenComponentModel;
  readonly meditrakSyncQueue: MeditrakSyncQueueModel;
}
