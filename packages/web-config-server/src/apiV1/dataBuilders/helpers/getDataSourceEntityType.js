/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { ENTITY_TYPES } from '/models/Entity';

const DEFAULT_ENTITY_TYPE = ENTITY_TYPES.FACILITY;

export function getDataSourceEntityType(config, defaultEntityType = DEFAULT_ENTITY_TYPE) {
  return config.dataSourceEntityType || defaultEntityType;
}

export const getAggregationEntityType = config => {
  return config.aggregationEntityType || DEFAULT_ENTITY_TYPE;
};
