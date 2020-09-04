/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AccessRequestModel } from './AccessRequest';
import { AlertCommentModel } from './AlertComment';
import { AlertModel } from './Alert';
import { AnswerModel } from './Answer';
import { CommentModel } from './Comment';
import { CountryModel } from './Country';
import { DashboardGroupModel } from './DashboardGroup';
import { DashboardReportModel } from './DashboardReport';
import { DataElementDataGroupModel } from './DataElementDataGroup';
import { DataSourceModel } from './DataSource';
import { EntityModel } from './Entity';
import { EntityRelationModel } from './EntityRelation';
import { GeographicalAreaModel } from './GeographicalArea';
import { MapOverlayGroupModel } from './MapOverlayGroup';
import { MapOverlayGroupRelationModel } from './MapOverlayGroupRelation';
import { MapOverlayModel } from './MapOverlay';
import { MeditrakDeviceModel } from './MeditrakDevice';
import { OneTimeLoginModel } from './OneTimeLogin';
import { PermissionGroupModel } from './PermissionGroup';
import { ProjectModel } from './Project';
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
  Alert: AlertModel,
  AlertComment: AlertCommentModel,
  Answer: AnswerModel,
  Comment: CommentModel,
  Country: CountryModel,
  DashboardGroup: DashboardGroupModel,
  DashboardReport: DashboardReportModel,
  DataElementDataGroup: DataElementDataGroupModel,
  DataSource: DataSourceModel,
  Entity: EntityModel,
  EntityRelation: EntityRelationModel,
  GeographicalArea: GeographicalAreaModel,
  MapOverlay: MapOverlayModel,
  MapOverlayGroup: MapOverlayGroupModel,
  MapOverlayGroupRelation: MapOverlayGroupRelationModel,
  MeditrakDevice: MeditrakDeviceModel,
  OneTimeLogin: OneTimeLoginModel,
  PermissionGroup: PermissionGroupModel,
  Project: ProjectModel,
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
export { AlertModel } from './Alert';
export { CommentModel } from './Comment';
export { CountryModel } from './Country';
export { DataSourceModel } from './DataSource';
export { EntityModel } from './Entity';
export { GeographicalAreaModel } from './GeographicalArea';
export { MeditrakDeviceModel } from './MeditrakDevice';
export { PermissionGroupModel } from './PermissionGroup';
export { SurveyScreenComponentModel } from './SurveyScreenComponent';
export { SurveyScreenModel } from './SurveyScreen';
export { UserEntityPermissionModel } from './UserEntityPermission';
