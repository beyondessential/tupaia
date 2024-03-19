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
import { DashboardMailingListModel } from './DashboardMailingList';
import { DashboardMailingListEntryModel } from './DashboardMailingListEntry';
import { DashboardRelationModel } from './DashboardRelation';
import { DataElementDataGroupModel } from './DataElementDataGroup';
import { DataElementModel } from './DataElement';
import { DataGroupModel } from './DataGroup';
import { DataServiceSyncGroupModel } from './DataServiceSyncGroup';
import { DataTableModel } from './DataTable';
import { EntityModel } from './Entity';
import { EntityHierarchyModel } from './EntityHierarchy';
import { EntityRelationModel } from './EntityRelation';
import { ExternalDatabaseConnectionModel } from './ExternalDatabaseConnection';
import { FacilityModel } from './Facility';
import { FeedItemModel } from './FeedItem';
import { GeographicalAreaModel } from './GeographicalArea';
import { IndicatorModel } from './Indicator';
import { LandingPageModel } from './LandingPage';
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
  DashboardMailingList: DashboardMailingListModel,
  DashboardMailingListEntry: DashboardMailingListEntryModel,
  DashboardRelation: DashboardRelationModel,
  DataElementDataGroup: DataElementDataGroupModel,
  DataElementDataService: DataElementDataServiceModel,
  DataElement: DataElementModel,
  DataGroup: DataGroupModel,
  DataServiceEntity: DataServiceEntityModel,
  DataServiceSyncGroup: DataServiceSyncGroupModel,
  DataTable: DataTableModel,
  DhisInstance: DhisInstanceModel,
  Entity: EntityModel,
  EntityHierarchy: EntityHierarchyModel,
  EntityRelation: EntityRelationModel,
  ExternalDatabaseConnection: ExternalDatabaseConnectionModel,
  Facility: FacilityModel,
  FeedItem: FeedItemModel,
  GeographicalArea: GeographicalAreaModel,
  Indicator: IndicatorModel,
  LandingPage: LandingPageModel,
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
  AncestorDescendantRelationRecord,
} from './AncestorDescendantRelation';
export { APIClientModel } from './APIClient';
export { ApiRequestLogModel } from './ApiRequestLog';
export { CommentModel } from './Comment';
export { CountryModel, CountryRecord } from './Country';
export { DhisInstanceModel, DhisInstanceRecord } from './DhisInstance';
export { DataElementDataServiceModel } from './DataElementDataService';
export { DataElementModel, DataElementRecord } from './DataElement';
export { DataGroupModel, DataGroupRecord } from './DataGroup';
export { DataServiceSyncGroupModel, DataServiceSyncGroupRecord } from './DataServiceSyncGroup';
export { DataTableModel, DataTableRecord } from './DataTable';
export { EntityModel, EntityRecord } from './Entity';
export { EntityHierarchyModel, EntityHierarchyRecord } from './EntityHierarchy';
export { EntityRelationModel } from './EntityRelation';
export {
  ExternalDatabaseConnectionModel,
  ExternalDatabaseConnectionRecord,
} from './ExternalDatabaseConnection';
export { FacilityModel } from './Facility';
export { FeedItemModel, FeedItemRecord } from './FeedItem';
export { GeographicalAreaModel } from './GeographicalArea';
export {
  MapOverlayGroupRelationModel,
  MapOverlayGroupRelationRecord,
} from './MapOverlayGroupRelation';
export { MapOverlayGroupModel, MapOverlayGroupRecord } from './MapOverlayGroup';
export { MeditrakDeviceModel } from './MeditrakDevice';
export { MeditrakSyncQueueModel, MeditrakSyncQueueRecord } from './MeditrakSyncQueue';
export { OptionModel } from './Option';
export { OptionSetModel } from './OptionSet';
export { PermissionGroupModel, PermissionGroupRecord } from './PermissionGroup';
export { ProjectModel, ProjectRecord } from './Project';
export { QuestionModel } from './Question';
export { ReportModel, ReportRecord } from './Report';
export { SurveyModel, SurveyRecord } from './Survey';
export { SurveyGroupModel } from './SurveyGroup';
export { SurveyScreenComponentModel } from './SurveyScreenComponent';
export { SurveyResponseModel, SurveyResponseRecord } from './SurveyResponse';
export { SurveyScreenModel } from './SurveyScreen';
export { UserEntityPermissionModel, UserEntityPermissionRecord } from './UserEntityPermission';
export { UserModel, UserRecord } from './User';
export { SupersetInstanceModel } from './SupersetInstance';
export { DashboardRecord, DashboardModel } from './Dashboard';
export { DashboardItemRecord, DashboardItemModel } from './DashboardItem';
export { DashboardMailingListRecord, DashboardMailingListModel } from './DashboardMailingList';
export {
  DashboardMailingListEntryRecord,
  DashboardMailingListEntryModel,
} from './DashboardMailingListEntry';
export { DashboardRelationRecord, DashboardRelationModel } from './DashboardRelation';
export { OneTimeLoginRecord, OneTimeLoginModel } from './OneTimeLogin';
