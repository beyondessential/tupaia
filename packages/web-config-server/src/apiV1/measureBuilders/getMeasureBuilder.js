/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { measureBuilders, getLevels } from '/apiV1/measureBuilders';

const DEFAULT_NAME = 'valueForOrgGroup';

export const getMeasureBuilder = name => measureBuilders[name] || measureBuilders[DEFAULT_NAME];

export const getLevel = (name, measureBuilderConfig) => {
  if (!measureBuilderConfig) {
    return 'Facility';
  }
  const getLevelFunction = getLevels[`${name}`] || getLevels[`${DEFAULT_NAME}`];
  return getLevelFunction(measureBuilderConfig);
};
