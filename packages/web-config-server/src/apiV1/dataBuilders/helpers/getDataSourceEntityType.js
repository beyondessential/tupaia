/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { ENTITY_TYPES } from '/models/Entity';

const DEFAULT_ENTITY_TYPE = ENTITY_TYPES.FACILITY;
export function getDataSourceEntityType(config) {
  return config.dataSourceEntityType || DEFAULT_ENTITY_TYPE;
}
