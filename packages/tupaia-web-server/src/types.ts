/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry } from '@tupaia/database';
import {
  MapOverlayGroupRelationModel,
  MapOverlayGroupModel,
  DashboardItemModel,
  EntityModel,
} from './models';

export interface TupaiaWebServerModelRegistry extends ModelRegistry {
  readonly mapOverlayGroupRelation: MapOverlayGroupRelationModel;
  readonly mapOverlayGroup: MapOverlayGroupModel;
  readonly dashboardItem: DashboardItemModel;
  readonly entity: EntityModel;
}
