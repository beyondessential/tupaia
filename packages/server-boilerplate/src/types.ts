/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  ModelRegistry,
  ApiRequestLogModel,
  APIClientModel,
  UserEntityPermissionModel,
  PermissionGroupModel,
  UserEntityPermissionRecord,
  PermissionGroupRecord,
  CountryModel,
  CountryRecord,
  SurveyModel,
  SurveyRecord,
  OneTimeLoginModel,
  OptionModel,
  FacilityModel,
  GeographicalAreaModel,
  OptionSetModel,
  QuestionModel,
  SurveyGroupModel,
  SurveyScreenModel,
  SurveyScreenComponentModel,
  DashboardModel,
  DashboardRecord,
  DashboardItemModel,
  DashboardItemRecord,
  MapOverlayGroupModel,
  MapOverlayGroupRecord,
  DashboardMailingListEntryModel,
  DashboardMailingListEntryRecord,
  DataTableModel,
  DataTableRecord,
  ExternalDatabaseConnectionModel,
  ExternalDatabaseConnectionRecord,
  ProjectModel,
  EntityHierarchyModel,
  EntityHierarchyRecord,
  ReportModel,
  ReportRecord,
  OneTimeLoginRecord,
  DataElementModel,
  DataElementRecord,
  AnswerModel,
  AnswerRecord,
} from '@tupaia/database';
import {
  Country,
  Survey,
  OneTimeLogin,
  Dashboard,
  DashboardItem,
  MapOverlayGroup,
  DashboardMailingListEntry,
  DataTable,
  ExternalDatabaseConnection,
  EntityHierarchy,
  Report,
  UserEntityPermission,
  PermissionGroup,
  DataElement,
  Answer,
} from '@tupaia/types';
import {
  FeedItemModel,
  Model,
  UserModel,
  SurveyResponseModel,
  DashboardRelationModel,
  MapOverlayGroupRelationModel,
  AncestorDescendantRelationModel,
  EntityModel,
} from './models';

export type AccessPolicyObject = Record<string, string[]>;

export type EmptyObject = Record<string, never>;

/**
 * @deprecated use @tupaia/api-client
 */
export type QueryParameters = Record<string, string>;

export type RequestBody = Record<string, unknown> | Record<string, unknown>[];

export interface ServerBoilerplateModelRegistry extends ModelRegistry {
  readonly apiRequestLog: ApiRequestLogModel;
  readonly apiClient: APIClientModel;
  readonly user: UserModel;
  readonly userEntityPermission: Model<
    UserEntityPermissionModel,
    UserEntityPermission,
    UserEntityPermissionRecord & UserEntityPermission
  >;
  readonly entity: EntityModel;
  readonly permissionGroup: Model<
    PermissionGroupModel,
    PermissionGroup,
    PermissionGroupRecord & PermissionGroup
  >;
  readonly country: Model<CountryModel, Country, CountryRecord & Country>;
  readonly feedItem: FeedItemModel;
  readonly survey: Model<SurveyModel, Survey, SurveyRecord & Survey>;
  readonly surveyResponse: SurveyResponseModel;
  readonly oneTimeLogin: Model<
    OneTimeLoginModel,
    OneTimeLogin & OneTimeLoginRecord,
    OneTimeLoginRecord
  >;
  readonly option: OptionModel;
  readonly facility: FacilityModel;
  readonly geographicalArea: GeographicalAreaModel;
  readonly optionSet: OptionSetModel;
  readonly question: QuestionModel;
  readonly surveyGroup: SurveyGroupModel;
  readonly surveyScreen: SurveyScreenModel;
  readonly surveyScreenComponent: SurveyScreenComponentModel;
  readonly dashboard: Model<DashboardModel, Dashboard, DashboardRecord & Dashboard>;
  readonly dashboardItem: Model<
    DashboardItemModel,
    DashboardItem,
    DashboardItemRecord & DashboardItem
  >;
  readonly mapOverlayGroup: Model<
    MapOverlayGroupModel,
    MapOverlayGroup,
    MapOverlayGroupRecord & MapOverlayGroup
  >;
  readonly dashboardMailingListEntry: Model<
    DashboardMailingListEntryModel,
    DashboardMailingListEntry,
    DashboardMailingListEntryRecord & DashboardMailingListEntry
  >;
  readonly dashboardRelation: DashboardRelationModel;
  readonly mapOverlayGroupRelation: MapOverlayGroupRelationModel;
  readonly dataElement: Model<DataElementModel, DataElement, DataElementRecord & DataElement>;
  readonly answer: Model<AnswerModel, Answer, AnswerRecord>;
  readonly dataTable: Model<DataTableModel, DataTable, DataTableRecord & DataTable>;
  readonly externalDatabaseConnection: Model<
    ExternalDatabaseConnectionModel,
    ExternalDatabaseConnection,
    ExternalDatabaseConnection & ExternalDatabaseConnectionRecord
  >;
  readonly project: ProjectModel;
  readonly ancestorDescendantRelation: AncestorDescendantRelationModel;
  readonly entityHierarchy: Model<
    EntityHierarchyModel,
    EntityHierarchy,
    EntityHierarchyRecord & EntityHierarchy
  >;
  readonly report: Model<ReportModel, Report, ReportRecord & Report>;
}
