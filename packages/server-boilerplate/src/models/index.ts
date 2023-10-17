/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  DataTableModel as BaseDataTableModel,
  DataTableType as BaseDataTableType,
  DashboardModel as BaseDashboardModel,
  DashboardType as BaseDashboardType,
  DashboardItemModel as BaseDashboardItemModel,
  DashboardItemType as BaseDashboardItemType,
  DashboardRelationModel as BaseDashboardRelationModel,
  DashboardRelationType as BaseDashboardRelationType,
  ExternalDatabaseConnectionModel as BaseExternalDatabaseConnectionModel,
  ExternalDatabaseConnectionType as BaseExternalDatabaseConnectionType,
  EntityHierarchyModel as BaseEntityHierarchyModel,
  EntityHierarchyType as BaseEntityHierarchyType,
  MapOverlayGroupModel as BaseMapOverlayGroupModel,
  MapOverlayGroupType as BaseMapOverlayGroupType,
  MeditrakSyncQueueModel as BaseMeditrakSyncQueueModel,
  MeditrakSyncQueueType as BaseMeditrakSyncQueueType,
  ReportModel as BaseReportModel,
  ReportType as BaseReportType,
  SurveyModel as BaseSurveyModel,
  SurveyType as BaseSurveyType,
  UserModel as BaseUserModel,
  UserType as BaseUserType,
} from '@tupaia/database';
import {
  Dashboard,
  DashboardItem,
  DashboardRelation,
  DataTable,
  EntityHierarchy,
  ExternalDatabaseConnection,
  MapOverlayGroup,
  MeditrakSyncQueue,
  Report,
  Survey,
  UserAccount,
} from '@tupaia/types';
import { Model } from './types';

export {
  Model,
  DbFilter,
  FilterCriteria,
  AdvancedFilterValue,
  Joined,
  PartialOrArray,
  QueryConjunctions,
} from './types';

export {
  AncestorDescendantRelationModel,
  AncestorDescendantRelationType,
} from './AncestorDescendantRelation';
export { EntityModel, EntityType, EntityFilter, EntityFilterFields } from './Entity';
export { FeedItemModel, FeedItemType } from './FeedItem';
export {
  MapOverlayGroupRelationModel,
  MapOverlayGroupRelationType,
} from './MapOverlayGroupRelation';
export { ProjectModel, ProjectType } from './Project';
export { SurveyResponseModel, SurveyResponseType } from './SurveyResponse';

export interface UserType extends UserAccount, BaseUserType {}
export interface UserModel extends Model<BaseUserModel, UserAccount, UserType> {}

export interface DataTableType extends DataTable, BaseDataTableType {}
export interface DataTableModel extends Model<BaseDataTableModel, DataTable, DataTableType> {}

export interface DashboardType extends Dashboard, BaseDashboardType {}
export interface DashboardModel extends Model<BaseDashboardModel, Dashboard, DashboardType> {}

export interface DashboardItemType extends DashboardItem, BaseDashboardItemType {}
export interface DashboardItemModel
  extends Model<BaseDashboardItemModel, DashboardItem, DashboardItemType> {}

export interface DashboardRelationType extends DashboardRelation, BaseDashboardRelationType {}
export interface DashboardRelationModel
  extends Model<BaseDashboardRelationModel, DashboardRelation, DashboardRelationType> {}

export interface EntityHierarchyType extends EntityHierarchy, BaseEntityHierarchyType {}
export interface EntityHierarchyModel
  extends Model<BaseEntityHierarchyModel, EntityHierarchy, EntityHierarchyType> {}

export interface ExternalDatabaseConnectionType
  extends ExternalDatabaseConnection,
    BaseExternalDatabaseConnectionType {}
export interface ExternalDatabaseConnectionModel
  extends Model<
    BaseExternalDatabaseConnectionModel,
    ExternalDatabaseConnection,
    ExternalDatabaseConnectionType
  > {}

export interface MapOverlayGroupType extends MapOverlayGroup, BaseMapOverlayGroupType {}
export interface MapOverlayGroupModel
  extends Model<BaseMapOverlayGroupModel, MapOverlayGroup, MapOverlayGroupType> {}

export interface MeditrakSyncQueueType extends MeditrakSyncQueue, BaseMeditrakSyncQueueType {}
export interface MeditrakSyncQueueModel
  extends Model<BaseMeditrakSyncQueueModel, MeditrakSyncQueue, MeditrakSyncQueueType> {}

export interface ReportType extends Report, BaseReportType {}
export interface ReportModel extends Model<BaseReportModel, Report, ReportType> {}

export interface SurveyType extends Survey, BaseSurveyType {}
export interface SurveyModel extends Model<BaseSurveyModel, Survey, SurveyType> {}
