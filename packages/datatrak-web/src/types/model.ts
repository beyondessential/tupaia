import { Knex } from 'knex';

import { ModelRegistry } from '@tupaia/database';
import {
  AnswerModel,
  CountryModel,
  EntityHierarchyModel,
  EntityModel,
  EntityParentChildRelationModel,
  LocalSystemFactModel,
  OptionModel,
  OptionSetModel,
  PermissionGroupModel,
  ProjectModel,
  QuestionModel,
  SurveyGroupModel,
  SurveyModel,
  SurveyResponseModel,
  SurveyScreenComponentModel,
  SurveyScreenModel,
  TaskCommentModel,
  TaskModel,
  TombstoneModel,
  UserEntityPermissionModel,
  UserModel,
} from '@tupaia/tsmodels';
import { DatatrakDatabase } from '../database/DatatrakDatabase';

export interface DatatrakWebModelRegistry extends ModelRegistry {
  readonly database: DatatrakDatabase;

  readonly answer: AnswerModel;
  readonly country: CountryModel;
  readonly entity: EntityModel;
  readonly entityHierarchy: EntityHierarchyModel;
  readonly entityParentChildRelation: EntityParentChildRelationModel;
  readonly localSystemFact: LocalSystemFactModel;
  readonly option: OptionModel;
  readonly optionSet: OptionSetModel;
  readonly permissionGroup: PermissionGroupModel;
  readonly project: ProjectModel;
  readonly question: QuestionModel;
  readonly survey: SurveyModel;
  readonly surveyGroup: SurveyGroupModel;
  readonly surveyResponse: SurveyResponseModel;
  readonly surveyScreen: SurveyScreenModel;
  readonly surveyScreenComponent: SurveyScreenComponentModel;
  readonly task: TaskModel;
  readonly taskComment: TaskCommentModel;
  readonly tombstone: TombstoneModel;
  readonly user: UserModel;
  readonly userEntityPermission: UserEntityPermissionModel;

  wrapInTransaction<T = unknown>(
    wrappedFunction: (models: DatatrakWebModelRegistry) => Promise<T>,
    transactionConfig?: Knex.TransactionConfig,
  ): Promise<T>;
  wrapInReadOnlyTransaction<T = unknown>(
    wrappedFunction: (models: DatatrakWebModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'readOnly'>,
  ): Promise<T>;
  wrapInRepeatableReadTransaction<T = unknown>(
    wrappedFunction: (models: DatatrakWebModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'isolation'>,
  ): Promise<T>;
}
