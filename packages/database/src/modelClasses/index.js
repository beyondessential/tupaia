/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AccessRequestModel } from './AccessRequest';
import { AnswerModel } from './Answer';
import { CountryModel } from './Country';
import { DataElementDataGroupModel } from './DataElementDataGroup';
import { DataSourceModel } from './DataSource';
import { EntityModel } from './Entity';
import { GeographicalAreaModel } from './GeographicalArea';
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
  AccessRequest: AccessRequestModel,
  Answer: AnswerModel,
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
export { PermissionGroupModel } from './PermissionGroup';
export { SurveyScreenModel } from './SurveyScreen';
export { SurveyScreenComponentModel } from './SurveyScreenComponent';
export { UserEntityPermissionModel } from './UserEntityPermission';
