/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { ENTITY_TYPES } from '/models/Entity';

export function getDataSourceEntityType(config, defaultEntityType = ENTITY_TYPES.FACILITY) {
  return config.dataSourceEntityType || defaultEntityType;
}

export const getAggregationEntityType = config => {
  return config.aggregationEntityType || DEFAULT_ENTITY_TYPE;
};
