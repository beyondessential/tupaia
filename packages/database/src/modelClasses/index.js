/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AnswerModel } from './Answer';
import { DataElementDataGroupModel } from './DataElementDataGroup';
import { DataSourceModel } from './DataSource';
import { EntityModel } from './Entity';
import { PermissionGroupModel } from './PermissionGroup';
import { QuestionModel } from './Question';
import { SurveyModel } from './Survey';
import { SurveyResponseModel } from './SurveyResponse';
import { SurveyScreenComponentModel } from './SurveyScreenComponent';
import { SurveyScreenModel } from './SurveyScreen';
import { UserModel } from './User';

// export all models to be used in constructing a ModelRegistry
export const modelClasses = {
  Answer: AnswerModel,
  DataElementDataGroup: DataElementDataGroupModel,
  DataSource: DataSourceModel,
  Entity: EntityModel,
  PermissionGroup: PermissionGroupModel,
  Question: QuestionModel,
  Survey: SurveyModel,
  SurveyResponse: SurveyResponseModel,
  SurveyScreen: SurveyScreenModel,
  SurveyScreenComponent: SurveyScreenComponentModel,
  User: UserModel,
};
