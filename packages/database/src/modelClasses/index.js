/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AlertModel } from './Alert';
import { AlertCommentModel } from './AlertComment';
import { AnswerModel } from './Answer';
import { AccessRequestModel } from './AccessRequest';
import { CountryModel } from './Country';
import { CommentModel } from './Comment';
import { DataSourceModel } from './DataSource';
import { DataElementDataGroupModel } from './DataElementDataGroup';
import { EntityModel } from './Entity';
import { GeographicalAreaModel } from './GeographicalArea';
import { MeditrakDeviceModel } from './MeditrakDevice';
import { RefreshTokenModel } from './RefreshToken';
import { OneTimeLoginModel } from './OneTimeLogin';
import { PermissionGroupModel } from './PermissionGroup';
import { QuestionModel } from './Question';
import { SurveyModel } from './Survey';
import { SurveyResponseModel } from './SurveyResponse';
import { SurveyScreenComponentModel } from './SurveyScreenComponent';
import { SurveyScreenModel } from './SurveyScreen';
import { UserEntityPermissionModel } from './UserEntityPermission';
import { UserModel } from './User';

// export all models to be used in constructing a ModelRegistry
export const modelClasses = {
  Alert: AlertModel,
  AlertComment: AlertCommentModel,
  AccessRequest: AccessRequestModel,
  Answer: AnswerModel,
  Comment: CommentModel,
  Country: CountryModel,
  DataElementDataGroup: DataElementDataGroupModel,
  DataSource: DataSourceModel,
  Entity: EntityModel,
  GeographicalArea: GeographicalAreaModel,
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
export { AccessRequestModel } from './AccessRequest';
export { CountryModel } from './Country';
export { DataSourceModel } from './DataSource';
export { EntityModel } from './Entity';
export { GeographicalAreaModel } from './GeographicalArea';
export { MeditrakDeviceModel } from './MeditrakDevice';
export { AlertModel } from './Alert';
export { CommentModel } from './Comment';
export { PermissionGroupModel } from './PermissionGroup';
export { SurveyScreenModel } from './SurveyScreen';
export { SurveyScreenComponentModel } from './SurveyScreenComponent';
export { UserEntityPermissionModel } from './UserEntityPermission';
