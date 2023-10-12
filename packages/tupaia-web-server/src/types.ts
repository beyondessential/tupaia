/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry } from '@tupaia/database';
import {
  MapOverlayGroupRelationModel,
  MapOverlayGroupModel,
  DashboardItemModel,
  DashboardRelationModel,
  EntityModel,
  UserModel,
} from './models';

export interface TupaiaWebServerModelRegistry extends ModelRegistry {
  readonly mapOverlayGroupRelation: MapOverlayGroupRelationModel;
  readonly mapOverlayGroup: MapOverlayGroupModel;
  readonly dashboardItem: DashboardItemModel;
  readonly dashboardRelation: DashboardRelationModel;
  readonly dashboard: DashboardModel;
  readonly entity: EntityModel;
  readonly user: UserModel;
}
