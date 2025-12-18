import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import {
  CountryModel,
  EntityModel,
  FeedItemModel,
  OneTimeLoginModel,
  OptionModel,
  PermissionGroupModel,
  ProjectModel,
  SurveyModel,
  SurveyResponseModel,
  TaskCommentModel,
  TaskModel,
  UserEntityPermissionModel,
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
  readonly oneTimeLogin: OneTimeLoginModel;
  readonly option: OptionModel;
  readonly task: TaskModel;
  readonly userEntityPermission: UserEntityPermissionModel;
  readonly taskComment: TaskCommentModel;
  readonly project: ProjectModel;
  readonly permissionGroup: PermissionGroupModel;
}
