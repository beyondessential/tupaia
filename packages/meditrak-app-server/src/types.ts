import { Knex } from 'knex';

import { TupaiaApiClient } from '@tupaia/api-client';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
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

export type RequestContext = {
  services: TupaiaApiClient;
};

export interface MeditrakAppServerModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

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

  wrapInTransaction<T = unknown>(
    wrappedFunction: (models: MeditrakAppServerModelRegistry) => Promise<T>,
    transactionConfig?: Knex.TransactionConfig,
  ): Promise<T>;
  wrapInReadOnlyTransaction<T = unknown>(
    wrappedFunction: (models: MeditrakAppServerModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'readOnly'>,
  ): Promise<T>;
  wrapInRepeatableReadTransaction<T = unknown>(
    wrappedFunction: (models: MeditrakAppServerModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'isolationLevel'>,
  ): Promise<T>;
}
