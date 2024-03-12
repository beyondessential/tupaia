/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  ModelRegistry,
  ApiRequestLogModel,
  APIClientModel,
  UserEntityPermissionModel,
  EntityModel,
  PermissionGroupModel,
  EntityRecord,
  UserEntityPermissionRecord,
  PermissionGroupRecord,
  CountryModel,
  CountryRecord,
  SurveyModel,
  SurveyRecord,
  OneTimeLoginModel,
  OneTimeLoginRecord,
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
} from '@tupaia/database';
import {
  UserEntityPermission,
  Entity,
  PermissionGroup,
  Country,
  Survey,
  OneTimeLogin,
  Dashboard,
  DashboardItem,
  MapOverlayGroup,
  DashboardMailingListEntry,
  DataTable,
  ExternalDatabaseConnection,
} from '@tupaia/types';
import {
  FeedItemModel,
  Model,
  UserModel,
  SurveyResponseModel,
  DashboardRelationModel,
  MapOverlayGroupRelationModel,
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
  readonly entity: Model<EntityModel, Entity, EntityRecord & Entity>;
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
  readonly dataTable: Model<DataTableModel, DataTable, DataTableRecord & DataTable>;
  readonly externalDatabaseConnection: Model<
    ExternalDatabaseConnectionModel,
    ExternalDatabaseConnection,
    ExternalDatabaseConnection & ExternalDatabaseConnectionRecord
  >;
  readonly project: ProjectModel;
}
