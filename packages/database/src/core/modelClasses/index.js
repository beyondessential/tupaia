import { AccessRequestModel } from './AccessRequest';
import { AnalyticsModel } from './Analytics';
import { AncestorDescendantRelationModel } from './AncestorDescendantRelation';
import { AnswerModel } from './Answer';
import { ApiClientModel } from './ApiClient';
import { ApiRequestLogModel } from './ApiRequestLog';
import { CommentModel } from './Comment';
import { CountryModel } from './Country';
import { DashboardModel } from './Dashboard';
import { DashboardItemModel } from './DashboardItem';
import { DashboardMailingListModel } from './DashboardMailingList';
import { DashboardMailingListEntryModel } from './DashboardMailingListEntry';
import { DashboardRelationModel } from './DashboardRelation';
import { DataElementModel } from './DataElement';
import { DataElementDataGroupModel } from './DataElementDataGroup';
import { DataElementDataServiceModel } from './DataElementDataService';
import { DataGroupModel } from './DataGroup';
import { DataServiceEntityModel } from './DataServiceEntity';
import { DataServiceSyncGroupModel } from './DataServiceSyncGroup';
import { DataTableModel } from './DataTable';
import { DebugLogModel } from './DebugLog';
import { DhisInstanceModel } from './DhisInstance';
import { EntityModel } from './Entity';
import { EntityHierarchyModel } from './EntityHierarchy';
import { EntityParentChildRelationModel } from './EntityParentChildRelation';
import { EntityRelationModel } from './EntityRelation';
import { ExternalDatabaseConnectionModel } from './ExternalDatabaseConnection';
import { FacilityModel } from './Facility';
import { FeedItemModel } from './FeedItem';
import { GeographicalAreaModel } from './GeographicalArea';
import { IndicatorModel } from './Indicator';
import { LandingPageModel } from './LandingPage';
import { LegacyReportModel } from './LegacyReport';
import { LocalSystemFactModel } from './LocalSystemFact';
import { MapOverlayModel } from './MapOverlay';
import { MapOverlayGroupModel } from './MapOverlayGroup';
import { MapOverlayGroupRelationModel } from './MapOverlayGroupRelation';
import { MeditrakDeviceModel } from './MeditrakDevice';
import { MeditrakSyncQueueModel } from './MeditrakSyncQueue';
import { OneTimeLoginModel } from './OneTimeLogin';
import { OptionModel } from './Option';
import { OptionSetModel } from './OptionSet';
import { PermissionGroupModel } from './PermissionGroup';
import { ProjectModel } from './Project';
import { QuestionModel } from './Question';
import { RefreshTokenModel } from './RefreshToken';
import { ReportModel } from './Report';
import { SupersetInstanceModel } from './SupersetInstance';
import { SurveyModel } from './Survey';
import { SurveyGroupModel } from './SurveyGroup';
import { SurveyResponseModel } from './SurveyResponse';
import { SurveyResponseCommentModel } from './SurveyResponseComment';
import { SurveyScreenModel } from './SurveyScreen';
import { SurveyScreenComponentModel } from './SurveyScreenComponent';
import { SyncDeviceTickModel } from './SyncDeviceTick';
import { SyncGroupLogModel } from './SyncGroupLog';
import { SyncQueuedDeviceModel } from './SyncQueuedDevice';
import { SyncSessionModel } from './SyncSession';
import { TaskModel } from './Task';
import { TaskCommentModel } from './TaskComment';
import { TombstoneModel } from './Tombstone';
import { UserModel } from './User';
import { UserCountryAccessAttemptModel } from './UserCountryAccessAttempt';
import { UserEntityPermissionModel } from './UserEntityPermission';
import { UserFavouriteDashboardItemModel } from './UserFavouriteDashboardItem';
import { UserSessionModel } from './UserSession';

// export all models to be used in constructing a ModelRegistry
export const modelClasses = {
  Analytics: AnalyticsModel,
  AccessRequest: AccessRequestModel,
  AncestorDescendantRelation: AncestorDescendantRelationModel,
  Answer: AnswerModel,
  ApiClient: ApiClientModel,
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
  DebugLog: DebugLogModel,
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
  LocalSystemFact: LocalSystemFactModel,
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
  EntityParentChildRelation: EntityParentChildRelationModel,
  Report: ReportModel,
  SupersetInstance: SupersetInstanceModel,
  Survey: SurveyModel,
  SurveyGroup: SurveyGroupModel,
  SurveyResponse: SurveyResponseModel,
  SurveyResponseComment: SurveyResponseCommentModel,
  SurveyScreen: SurveyScreenModel,
  SurveyScreenComponent: SurveyScreenComponentModel,
  SyncGroupLog: SyncGroupLogModel,
  Task: TaskModel,
  TaskComment: TaskCommentModel,
  Tombstone: TombstoneModel,
  User: UserModel,
  UserEntityPermission: UserEntityPermissionModel,
  UserFavouriteDashboardItem: UserFavouriteDashboardItemModel,
  UserSession: UserSessionModel,
  UserCountryAccessAttempt: UserCountryAccessAttemptModel,
  SyncSession: SyncSessionModel,
  SyncDeviceTick: SyncDeviceTickModel,
  SyncQueuedDevice: SyncQueuedDeviceModel,
};

export { AccessRequestModel, AccessRequestRecord } from './AccessRequest';
export { AnalyticsModel, AnalyticsRecord } from './Analytics';
export {
  AncestorDescendantRelationModel,
  AncestorDescendantRelationRecord,
} from './AncestorDescendantRelation';
export { AnswerModel, AnswerRecord } from './Answer';
export { ApiClientModel, ApiClientRecord } from './ApiClient';
export { ApiRequestLogModel, ApiRequestLogRecord } from './ApiRequestLog';
export { CommentModel, CommentRecord } from './Comment';
export { CountryModel, CountryRecord } from './Country';
export { DashboardModel, DashboardRecord } from './Dashboard';
export { DashboardItemModel, DashboardItemRecord } from './DashboardItem';
export { DashboardMailingListModel, DashboardMailingListRecord } from './DashboardMailingList';
export {
  DashboardMailingListEntryModel,
  DashboardMailingListEntryRecord,
} from './DashboardMailingListEntry';
export { DashboardRelationModel, DashboardRelationRecord } from './DashboardRelation';
export { DashboardReportModel, DashboardReportRecord } from './DashboardReport';
export { DataElementModel, DataElementRecord } from './DataElement';
export { DataElementDataGroupModel, DataElementDataGroupRecord } from './DataElementDataGroup';
export {
  DataElementDataServiceModel,
  DataElementDataServiceRecord,
} from './DataElementDataService';
export { DataGroupModel, DataGroupRecord } from './DataGroup';
export { DataServiceEntityModel, DataServiceEntityRecord } from './DataServiceEntity';
export { DataServiceSyncGroupModel, DataServiceSyncGroupRecord } from './DataServiceSyncGroup';
export { DataTableModel, DataTableRecord } from './DataTable';
export { DebugLogModel, DebugLogRecord } from './DebugLog';
export { DhisInstanceModel, DhisInstanceRecord } from './DhisInstance';
export { EntityModel, EntityRecord } from './Entity';
export { EntityHierarchyModel, EntityHierarchyRecord } from './EntityHierarchy';
export {
  EntityParentChildRelationModel,
  EntityParentChildRelationRecord,
} from './EntityParentChildRelation';
export { EntityRelationModel, EntityRelationRecord } from './EntityRelation';
export {
  ExternalDatabaseConnectionModel,
  ExternalDatabaseConnectionRecord,
} from './ExternalDatabaseConnection';
export { FacilityModel, FacilityRecord } from './Facility';
export { FeedItemModel, FeedItemRecord } from './FeedItem';
export { GeographicalAreaModel, GeographicalAreaRecord } from './GeographicalArea';
export { IndicatorModel, IndicatorRecord } from './Indicator';
export { LandingPageModel, LandingPageRecord } from './LandingPage';
export { LegacyReportModel, LegacyReportRecord } from './LegacyReport';
export { LocalSystemFactModel, LocalSystemFactRecord } from './LocalSystemFact';
export { MapOverlayModel, MapOverlayRecord } from './MapOverlay';
export { MapOverlayGroupModel, MapOverlayGroupRecord } from './MapOverlayGroup';
export {
  MapOverlayGroupRelationModel,
  MapOverlayGroupRelationRecord,
} from './MapOverlayGroupRelation';
export { MeditrakDeviceModel, MeditrakDeviceRecord } from './MeditrakDevice';
export { MeditrakSyncQueueModel, MeditrakSyncQueueRecord } from './MeditrakSyncQueue';
export { OneTimeLoginModel, OneTimeLoginRecord } from './OneTimeLogin';
export { OptionModel, OptionRecord } from './Option';
export { OptionSetModel, OptionSetRecord } from './OptionSet';
export { PermissionGroupModel, PermissionGroupRecord } from './PermissionGroup';
export { ProjectModel, ProjectRecord } from './Project';
export { QuestionModel, QuestionRecord } from './Question';
export { RefreshTokenModel, RefreshTokenRecord } from './RefreshToken';
export { ReportModel, ReportRecord } from './Report';
export { SupersetInstanceModel, SupersetInstanceRecord } from './SupersetInstance';
export { SurveyModel, SurveyRecord } from './Survey';
export { SurveyGroupModel, SurveyGroupRecord } from './SurveyGroup';
export { SurveyResponseModel, SurveyResponseRecord } from './SurveyResponse';
export { SurveyResponseCommentModel, SurveyResponseCommentRecord } from './SurveyResponseComment';
export { SurveyScreenModel, SurveyScreenRecord } from './SurveyScreen';
export { SurveyScreenComponentModel, SurveyScreenComponentRecord } from './SurveyScreenComponent';
export { SyncDeviceTickModel, SyncDeviceTickRecord } from './SyncDeviceTick';
export { SyncGroupLogModel, SyncGroupLogRecord } from './SyncGroupLog';
export { SyncQueuedDeviceModel, SyncQueuedDeviceRecord } from './SyncQueuedDevice';
export { SyncSessionModel, SyncSessionRecord } from './SyncSession';
export { TaskModel, TaskRecord } from './Task';
export { TaskCommentModel, TaskCommentRecord } from './TaskComment';
export { TombstoneModel, TombstoneRecord } from './Tombstone';
export { UserModel, UserRecord } from './User';
export {
  UserCountryAccessAttemptModel,
  UserCountryAccessAttemptRecord,
} from './UserCountryAccessAttempt';
export { UserEntityPermissionModel, UserEntityPermissionRecord } from './UserEntityPermission';
export {
  UserFavouriteDashboardItemModel,
  UserFavouriteDashboardItemRecord,
} from './UserFavouriteDashboardItem';
