import { AnalyticsModel } from './Analytics';
import { AccessRequestModel } from './AccessRequest';
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
import { DataElementDataGroupModel } from './DataElementDataGroup';
import { DataElementModel } from './DataElement';
import { DataGroupModel } from './DataGroup';
import { DataServiceSyncGroupModel } from './DataServiceSyncGroup';
import { DataTableModel } from './DataTable';
import { DebugLogModel } from './DebugLog';
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
import { LocalSystemFactModel } from './LocalSystemFact';
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
import { EntityParentChildRelationModel } from './EntityParentChildRelation';
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
import { TaskModel } from './Task';
import { UserCountryAccessAttemptModel } from './UserCountryAccessAttempt';
import { TaskCommentModel } from './TaskComment';
import { SyncSessionModel } from './SyncSession';
import { SyncDeviceTickModel } from './SyncDeviceTick';
import { SyncQueuedDeviceModel } from './SyncQueuedDevice';

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
  User: UserModel,
  UserEntityPermission: UserEntityPermissionModel,
  UserFavouriteDashboardItem: UserFavouriteDashboardItemModel,
  UserSession: UserSessionModel,
  UserCountryAccessAttempt: UserCountryAccessAttemptModel,
  SyncSession: SyncSessionModel,
  SyncDeviceTick: SyncDeviceTickModel,
  SyncQueuedDevice: SyncQueuedDeviceModel,
};

// export any models and types that are extended in other packages
export { AccessRequestModel, AccessRequestRecord } from './AccessRequest';
export {
  AncestorDescendantRelationModel,
  AncestorDescendantRelationRecord,
} from './AncestorDescendantRelation';
export { ApiClientModel, ApiClientRecord } from './ApiClient';
export { ApiRequestLogModel, ApiRequestLogRecord } from './ApiRequestLog';
export { CommentModel, CommentRecord } from './Comment';
export { CountryModel, CountryRecord } from './Country';
export { DhisInstanceModel, DhisInstanceRecord } from './DhisInstance';
export {
  DataElementDataServiceModel,
  DataElementDataServiceRecord,
} from './DataElementDataService';
export { DataElementModel, DataElementRecord } from './DataElement';
export { DataGroupModel, DataGroupRecord } from './DataGroup';
export { DataServiceSyncGroupModel, DataServiceSyncGroupRecord } from './DataServiceSyncGroup';
export { DataTableModel, DataTableRecord } from './DataTable';
export { DebugLogModel, DebugLogRecord } from './DebugLog';
export { EntityModel, EntityRecord } from './Entity';
export { EntityHierarchyModel, EntityHierarchyRecord } from './EntityHierarchy';
export { EntityRelationModel, EntityRelationRecord } from './EntityRelation';
export {
  ExternalDatabaseConnectionModel,
  ExternalDatabaseConnectionRecord,
} from './ExternalDatabaseConnection';
export { FacilityModel, FacilityRecord } from './Facility';
export { FeedItemModel, FeedItemRecord } from './FeedItem';
export { GeographicalAreaModel, GeographicalAreaRecord } from './GeographicalArea';
export { MapOverlayModel, MapOverlayRecord } from './MapOverlay';
export {
  MapOverlayGroupRelationModel,
  MapOverlayGroupRelationRecord,
} from './MapOverlayGroupRelation';
export { MapOverlayGroupModel, MapOverlayGroupRecord } from './MapOverlayGroup';
export { MeditrakDeviceModel, MeditrakDeviceRecord } from './MeditrakDevice';
export { MeditrakSyncQueueModel, MeditrakSyncQueueRecord } from './MeditrakSyncQueue';
export { OptionModel, OptionRecord } from './Option';
export { OptionSetModel, OptionSetRecord } from './OptionSet';
export { PermissionGroupModel, PermissionGroupRecord } from './PermissionGroup';
export { ProjectModel, ProjectRecord } from './Project';
export { QuestionModel, QuestionRecord } from './Question';
export { ReportModel, ReportRecord } from './Report';
export {
  EntityParentChildRelationModel,
  EntityParentChildRelationRecord,
} from './EntityParentChildRelation';
export { SurveyModel, SurveyRecord } from './Survey';
export { SurveyGroupModel, SurveyGroupRecord } from './SurveyGroup';
export { SurveyScreenComponentModel, SurveyScreenComponentRecord } from './SurveyScreenComponent';
export { SurveyResponseModel, SurveyResponseRecord } from './SurveyResponse';
export { SurveyScreenModel, SurveyScreenRecord } from './SurveyScreen';
export { UserEntityPermissionModel, UserEntityPermissionRecord } from './UserEntityPermission';
export { UserModel, UserRecord } from './User';
export { SupersetInstanceModel, SupersetInstanceRecord } from './SupersetInstance';
export { DashboardRecord, DashboardModel } from './Dashboard';
export { DashboardItemRecord, DashboardItemModel } from './DashboardItem';
export { DashboardMailingListRecord, DashboardMailingListModel } from './DashboardMailingList';
export {
  DashboardMailingListEntryRecord,
  DashboardMailingListEntryModel,
} from './DashboardMailingListEntry';
export { DashboardRelationRecord, DashboardRelationModel } from './DashboardRelation';
export { OneTimeLoginRecord, OneTimeLoginModel } from './OneTimeLogin';
export { AnswerModel, AnswerRecord } from './Answer';
export { TaskModel, TaskRecord } from './Task';
export {
  UserCountryAccessAttemptModel,
  UserCountryAccessAttemptRecord,
} from './UserCountryAccessAttempt';
export { TaskCommentModel, TaskCommentRecord } from './TaskComment';
export { LocalSystemFactModel, LocalSystemFactRecord } from './LocalSystemFact';
export { SyncSessionModel, SyncSessionRecord } from './SyncSession';
export { SyncDeviceTickModel, SyncDeviceTickRecord } from './SyncDeviceTick';
export { SyncQueuedDeviceModel, SyncQueuedDeviceRecord } from './SyncQueuedDevice';
