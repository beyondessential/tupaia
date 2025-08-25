import {
  AnswerModel,
  CountryModel,
  EntityModel,
  LocalSystemFactModel,
  ModelRegistry,
  OptionSetModel,
  OptionModel,
  PermissionGroupModel,
  ProjectModel,
  QuestionModel,
  SurveyModel,
  SurveyGroupModel,
  SurveyResponseModel,
  SurveyScreenModel,
  SurveyScreenComponentModel,
  TaskModel,
  TaskCommentModel,
  TombstoneModel,
  UserModel,
  UserEntityPermissionModel,
  EntityHierarchyModel,
  EntityParentChildRelationModel,
} from '@tupaia/tsmodels';

export interface DatatrakWebModelRegistry extends ModelRegistry {
  readonly localSystemFact: LocalSystemFactModel;
  readonly optionSet: OptionSetModel;
  readonly option: OptionModel;
  readonly survey: SurveyModel;
  readonly surveyGroup: SurveyGroupModel;
  readonly surveyResponse: SurveyResponseModel;
  readonly surveyScreen: SurveyScreenModel;
  readonly surveyScreenComponent: SurveyScreenComponentModel;
  readonly question: QuestionModel;
  readonly answer: AnswerModel;
  readonly tombstone: TombstoneModel;
  readonly country: CountryModel;
  readonly entity: EntityModel;
  readonly entityHierarchy: EntityHierarchyModel;
  readonly entityParentChildRelation: EntityParentChildRelationModel;
  readonly project: ProjectModel;
  readonly permissionGroup: PermissionGroupModel;
  readonly userEntityPermission: UserEntityPermissionModel;
  readonly user: UserModel;
  readonly task: TaskModel;
  readonly taskComment: TaskCommentModel;
}
