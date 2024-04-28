/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { ModelRegistry } from '@tupaia/database';
import {
  CountryModel,
  DashboardItemModel,
  DashboardMailingListEntryModel,
  DashboardModel,
  DashboardRelationModel,
  EntityModel,
  MapOverlayGroupModel,
  MapOverlayGroupRelationModel,
  ProjectModel,
  UserModel,
} from '@tupaia/server-boilerplate';

export interface TupaiaWebServerModelRegistry extends ModelRegistry {
  readonly country: CountryModel;
  readonly dashboard: DashboardModel;
  readonly dashboardItem: DashboardItemModel;
  readonly dashboardMailingListEntry: DashboardMailingListEntryModel;
  readonly dashboardRelation: DashboardRelationModel;
  readonly entity: EntityModel;
  readonly mapOverlayGroup: MapOverlayGroupModel;
  readonly mapOverlayGroupRelation: MapOverlayGroupRelationModel;
  readonly user: UserModel;
  readonly project: ProjectModel;
}
