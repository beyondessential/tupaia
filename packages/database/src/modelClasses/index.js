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
import { DataElementDataGroupModel } from './DataElementDataGroup';
import { DataSourceModel } from './DataSource';
import { EntityModel } from './Entity';
import { EntityHierarchyModel } from './EntityHierarchy';
import { EntityRelationModel } from './EntityRelation';
import { GeographicalAreaModel } from './GeographicalArea';
import { IndicatorModel } from './Indicator';
import { MeditrakDeviceModel } from './MeditrakDevice';
import { RefreshTokenModel } from './RefreshToken';
import { OneTimeLoginModel } from './OneTimeLogin';
import { PermissionGroupModel } from './PermissionGroup';
import { ProjectModel } from './Project';
import { QuestionModel } from './Question';
import { SurveyModel } from './Survey';
import { SurveyResponseModel } from './SurveyResponse';
import { SurveyScreenComponentModel } from './SurveyScreenComponent';
import { SurveyScreenModel } from './SurveyScreen';
import { UserEntityPermissionModel } from './UserEntityPermission';
import { UserModel } from './User';
import { DashboardReportModel } from './DashboardReport';
import { MapOverlayModel } from './MapOverlay';
import { MapOverlayGroupModel } from './MapOverlayGroup';
import { MapOverlayGroupRelationModel } from './MapOverlayGroupRelation';
import { DashboardGroupModel } from './DashboardGroup';

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
  EntityHierarchy: EntityHierarchyModel,
  EntityRelation: EntityRelationModel,
  GeographicalArea: GeographicalAreaModel,
  Indicator: IndicatorModel,
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
  DashboardReport: DashboardReportModel,
  MapOverlay: MapOverlayModel,
  MapOverlayGroup: MapOverlayGroupModel,
  MapOverlayGroupRelation: MapOverlayGroupRelationModel,
  DashboardGroup: DashboardGroupModel,
};

// export any models and types that are extended in other packages
export { AccessRequestModel } from './AccessRequest';
export { CountryModel } from './Country';
export { DataSourceModel } from './DataSource';
export { EntityModel } from './Entity';
export { EntityHierarchyModel } from './EntityHierarchy';
export { EntityRelationModel } from './EntityRelation';
export { GeographicalAreaModel } from './GeographicalArea';
export { MeditrakDeviceModel } from './MeditrakDevice';
export { AlertModel } from './Alert';
export { CommentModel } from './Comment';
export { PermissionGroupModel } from './PermissionGroup';
export { SurveyScreenModel } from './SurveyScreen';
export { SurveyScreenComponentModel } from './SurveyScreenComponent';
export { UserEntityPermissionModel } from './UserEntityPermission';
export { DashboardReportModel } from './DashboardReport';
export { MapOverlayModel } from './MapOverlay';
export { MapOverlayGroupModel } from './MapOverlayGroup';
export { MapOverlayGroupRelationModel } from './MapOverlayGroupRelation';
export { DashboardGroupModel } from './DashboardGroup';
