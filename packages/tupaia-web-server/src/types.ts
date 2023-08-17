/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry } from '@tupaia/database';
import { MapOverlayGroupRelationModel } from './models';

export interface TupaiaWebServerModelRegistry extends ModelRegistry {
  readonly mapOverlayGroupRelation: MapOverlayGroupRelationModel;
}
