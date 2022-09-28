/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AnalyticsModel } from './Analytics';
import { AccessRequestModel } from './AccessRequest';
import { AncestorDescendantRelationModel } from './AncestorDescendantRelation';
import { AnswerModel } from './Answer';
import { APIClientModel } from './APIClient';
import { ApiRequestLogModel } from './ApiRequestLog';
import { CommentModel } from './Comment';
import { CountryModel } from './Country';
import { DashboardModel } from './Dashboard';
import { DashboardItemModel } from './DashboardItem';
import { DashboardRelationModel } from './DashboardRelation';
import { DataElementDataGroupModel } from './DataElementDataGroup';
import { DataElementModel } from './DataElement';
import { DataGroupModel } from './DataGroup';
import { DataServiceSyncGroupModel } from './DataServiceSyncGroup';
import { DataTableModel } from './DataTable';
import { DisasterModel } from './Disaster';
import { DisasterEventModel } from './DisasterEvent';
import { EntityModel } from './Entity';
import { EntityHierarchyModel } from './EntityHierarchy';
import { EntityRelationModel } from './EntityRelation';
import { FacilityModel } from './Facility';
import { FeedItemModel } from './FeedItem';
import { GeographicalAreaModel } from './GeographicalArea';
import { IndicatorModel } from './Indicator';
import { LegacyReportModel } from './LegacyReport';
import { UserFavouriteDashboardItemModel } from './UserFavouriteDashboardItem';
import { MapOverlayGroupModel } from './MapOverlayGroup';
import { MapOverlayGroupRelationModel } from './MapOverlayGroupRelation';
import { MapOverlayModel } from './MapOverlay';
import { MeditrakDeviceModel } from './MeditrakDevice';
import { MeditrakSyncQueueModel } from './MeditrakSyncQueue';
import { OneTimeLoginModel } from './OneTimeLogin';
import { OptionModel } from './Option';
import { OptionSetModel } from './OptionSet';
import { PermissionGroupModel } from './PermissionGroup';
import { ProjectModel } from './Project';
import { QuestionModel } from './Question';
import { ReportModel } from './Report';
import { RefreshTokenModel } from './RefreshToken';
import { SurveyModel } from './Survey';
import { SurveyGroupModel } from './SurveyGroup';
import { SurveyResponseModel } from './SurveyResponse';
import { SurveyResponseCommentModel } from './SurveyResponseComment';
import { SurveyScreenComponentModel } from './SurveyScreenComponent';
import { SurveyScreenModel } from './SurveyScreen';
import { SyncGroupLogModel } from './SyncGroupLog';
import { UserEntityPermissionModel } from './UserEntityPermission';
import { UserModel } from './User';
import { UserSessionModel } from './UserSession';
import { DataServiceEntityModel } from './DataServiceEntity';
import { DhisInstanceModel } from './DhisInstance';
import { DataElementDataServiceModel } from './DataElementDataService';
import { SupersetInstanceModel } from './SupersetInstance';

// export all models to be used in constructing a ModelRegistry
export const modelClasses = {
  Analytics: AnalyticsModel,
  AccessRequest: AccessRequestModel,
  AncestorDescendantRelation: AncestorDescendantRelationModel,
  Answer: AnswerModel,
  ApiClient: APIClientModel,
  ApiRequestLog: ApiRequestLogModel,
  Comment: CommentModel,
  Country: CountryModel,
  Dashboard: DashboardModel,
  DashboardItem: DashboardItemModel,
  DashboardRelation: DashboardRelationModel,
  DataElementDataGroup: DataElementDataGroupModel,
  DataElementDataService: DataElementDataServiceModel,
  DataElement: DataElementModel,
  DataGroup: DataGroupModel,
  DataServiceEntity: DataServiceEntityModel,
  DataServiceSyncGroup: DataServiceSyncGroupModel,
  DataTable: DataTableModel,
  DhisInstance: DhisInstanceModel,
  Disaster: DisasterModel,
  DisasterEvent: DisasterEventModel,
  Entity: EntityModel,
  EntityHierarchy: EntityHierarchyModel,
  EntityRelation: EntityRelationModel,
  Facility: FacilityModel,
  FeedItem: FeedItemModel,
  GeographicalArea: GeographicalAreaModel,
  Indicator: IndicatorModel,
  LegacyReport: LegacyReportModel,
  MapOverlay: MapOverlayModel,
  MapOverlayGroup: MapOverlayGroupModel,
  MapOverlayGroupRelation: MapOverlayGroupRelationModel,
  MeditrakDevice: MeditrakDeviceModel,
  MeditrakSyncQueue: MeditrakSyncQueueModel,
  OneTimeLogin: OneTimeLoginModel,
  Option: OptionModel,
  OptionSet: OptionSetModel,
  PermissionGroup: PermissionGroupModel,
  Project: ProjectModel,
  Question: QuestionModel,
  RefreshToken: RefreshTokenModel,
  Report: ReportModel,
  SupersetInstance: SupersetInstanceModel,
  Survey: SurveyModel,
  SurveyGroup: SurveyGroupModel,
  SurveyResponse: SurveyResponseModel,
  SurveyResponseComment: SurveyResponseCommentModel,
  SurveyScreen: SurveyScreenModel,
  SurveyScreenComponent: SurveyScreenComponentModel,
  SyncGroupLog: SyncGroupLogModel,
  User: UserModel,
  UserEntityPermission: UserEntityPermissionModel,
  UserFavouriteDashboardItem: UserFavouriteDashboardItemModel,
  UserSession: UserSessionModel,
};

// export any models and types that are extended in other packages
export { AccessRequestModel } from './AccessRequest';
export {
  AncestorDescendantRelationModel,
  AncestorDescendantRelationType,
} from './AncestorDescendantRelation';
export { ApiRequestLogModel } from './ApiRequestLog';
export { CommentModel } from './Comment';
export { CountryModel } from './Country';
export { DhisInstanceModel, DhisInstanceType } from './DhisInstance';
export { DataElementDataServiceModel } from './DataElementDataService';
export { DataElementModel, DataElementType } from './DataElement';
export { DataGroupModel, DataGroupType } from './DataGroup';
export { DataTableModel, DataTableType } from './DataTable';
export { EntityModel, EntityType } from './Entity';
export { EntityHierarchyModel, EntityHierarchyType } from './EntityHierarchy';
export { EntityRelationModel } from './EntityRelation';
export { FacilityModel } from './Facility';
export { FeedItemModel, FeedItemType } from './FeedItem';
export { GeographicalAreaModel } from './GeographicalArea';
export { MeditrakDeviceModel } from './MeditrakDevice';
export { MeditrakSyncQueueModel, MeditrakSyncQueueType } from './MeditrakSyncQueue';
export { OptionModel } from './Option';
export { OptionSetModel } from './OptionSet';
export { PermissionGroupModel } from './PermissionGroup';
export { ProjectModel } from './Project';
export { QuestionModel } from './Question';
export { ReportModel, ReportType } from './Report';
export { SurveyModel } from './Survey';
export { SurveyGroupModel } from './SurveyGroup';
export { SurveyScreenComponentModel } from './SurveyScreenComponent';
export { SurveyResponseModel, SurveyResponseType } from './SurveyResponse';
export { SurveyScreenModel } from './SurveyScreen';
export { UserEntityPermissionModel } from './UserEntityPermission';
export { UserModel, UserType } from './User';
export { SupersetInstanceModel } from './SupersetInstance';
