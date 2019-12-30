/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { getMeasureBuilder } from './getMeasureBuilder';

export const fetchComposedData = async (dhisApi, query, config) => {
  const { measureBuilders } = config || {};
  if (!measureBuilders) {
    throw new Error('Measure builders not provided');
  }

  const responses = {};
  const addResponse = async ([builderKey, builderData]) => {
    const { measureBuilder: builderName, measureBuilderConfig: builderConfig } = builderData;
    const buildMeasure = getMeasureBuilder(builderName);
    responses[builderKey] = await buildMeasure(dhisApi, query, builderConfig);
  };
  await Promise.all(Object.entries(measureBuilders).map(addResponse));

  return responses;
};
