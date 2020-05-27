/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AlertModel } from './Alert';
import { AlertCommentModel } from './AlertComment';
import { AnswerModel } from './Answer';
import { CountryModel } from './Country';
import { CommentModel } from './Comment';
import { DataElementDataGroupModel } from './DataElementDataGroup';
import { DataSourceModel } from './DataSource';
import { EntityModel } from './Entity';
import { GeographicalAreaModel } from './GeographicalArea';
import { MeditrakDeviceModel } from './MeditrakDevice';
import { RefreshTokenModel } from './RefreshToken';
import { PermissionGroupModel } from './PermissionGroup';
import { QuestionModel } from './Question';
import { SurveyModel } from './Survey';
import { SurveyResponseModel } from './SurveyResponse';
import { SurveyScreenComponentModel } from './SurveyScreenComponent';
import { SurveyScreenModel } from './SurveyScreen';
import { UserModel } from './User';

// export all models to be used in constructing a ModelRegistry
export const modelClasses = {
  Alert: AlertModel,
  AlertComment: AlertCommentModel,
  Answer: AnswerModel,
  Country: CountryModel,
  Comment: CommentModel,
  DataElementDataGroup: DataElementDataGroupModel,
  DataSource: DataSourceModel,
  GeographicalArea: GeographicalAreaModel,
  MeditrakDevice: MeditrakDeviceModel,
  Entity: EntityModel,
  PermissionGroup: PermissionGroupModel,
  Question: QuestionModel,
  RefreshToken: RefreshTokenModel,
  Survey: SurveyModel,
  SurveyResponse: SurveyResponseModel,
  SurveyScreen: SurveyScreenModel,
  SurveyScreenComponent: SurveyScreenComponentModel,
  User: UserModel,
};

// export any models and types that are extended in other packages
export { CountryModel } from './Country';
export { GeographicalAreaModel } from './GeographicalArea';
export { MeditrakDeviceModel } from './MeditrakDevice';
export { DataSourceModel } from './DataSource';
export { AlertModel } from './Alert';
export { CommentModel } from './Comment';
