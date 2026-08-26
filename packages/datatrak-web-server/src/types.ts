import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import {
  CountryModel,
  EntityModel,
  FeedItemModel,
  OneTimeLoginModel,
  PermissionGroupModel,
  ProjectModel,
  SurveyModel,
  SurveyResponseModel,
  SurveyResponseDraftModel,
  TaskModel,
  UserModel,
} from '@tupaia/server-boilerplate';

export interface DatatrakWebServerModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly user: UserModel;
  readonly entity: EntityModel;
  readonly country: CountryModel;
  readonly feedItem: FeedItemModel;
  readonly survey: SurveyModel;
  readonly surveyResponse: SurveyResponseModel;
  readonly surveyResponseDraft: SurveyResponseDraftModel;
  readonly oneTimeLogin: OneTimeLoginModel;
  readonly task: TaskModel;
  readonly project: ProjectModel;
  readonly permissionGroup: PermissionGroupModel;
}
