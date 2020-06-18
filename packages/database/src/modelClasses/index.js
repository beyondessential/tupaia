/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AnswerModel } from './Answer';
import { CountryModel } from './Country';
import { DataElementDataGroupModel } from './DataElementDataGroup';
import { DataSourceModel } from './DataSource';
import { EntityModel } from './Entity';
import { MeditrakDeviceModel } from './MeditrakDevice';
import { OneTimeLoginModel } from './OneTimeLogin';
import { PermissionGroupModel } from './PermissionGroup';
import { QuestionModel } from './Question';
import { RefreshTokenModel } from './RefreshToken';
import { SurveyModel } from './Survey';
import { SurveyResponseModel } from './SurveyResponse';
import { SurveyScreenComponentModel } from './SurveyScreenComponent';
import { SurveyScreenModel } from './SurveyScreen';
import { UserEntityPermissionModel } from './UserEntityPermission';
import { UserModel } from './User';

// export all models to be used in constructing a ModelRegistry
export const modelClasses = {
  Answer: AnswerModel,
  Country: CountryModel,
  DataElementDataGroup: DataElementDataGroupModel,
  DataSource: DataSourceModel,
  Entity: EntityModel,
  MeditrakDevice: MeditrakDeviceModel,
  OneTimeLogin: OneTimeLoginModel,
  PermissionGroup: PermissionGroupModel,
  Question: QuestionModel,
  RefreshToken: RefreshTokenModel,
  Survey: SurveyModel,
  SurveyResponse: SurveyResponseModel,
  SurveyScreen: SurveyScreenModel,
  SurveyScreenComponent: SurveyScreenComponentModel,
  User: UserModel,
  UserEntityPermission: UserEntityPermissionModel,
};

// export any models and types that are extended in other packages
export { UserEntityPermissionModel } from './UserEntityPermission';
