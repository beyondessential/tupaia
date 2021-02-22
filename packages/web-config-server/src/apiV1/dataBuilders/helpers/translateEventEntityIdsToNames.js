/**
 * Tupaia Config Server
 * Copyright (c) 2019 - 2021 Beyond Essential Systems Pty Ltd
 */

import { transformValue } from 'apiV1/dataBuilders/transform';

export const translateEventEntityIdsToNames = async (models, events, dataElementCodes) => {
  return Promise.all(
    events.map(async event => {
      const updatedDataValues = await dataElementCodes.reduce(async (acc, dataElementCode) => {
        const dataValueEntityId = event.dataValues[dataElementCode];
        if (dataValueEntityId) {
          const entityName = await transformValue(models, 'entityIdToName', dataValueEntityId);
          return { ...acc, [dataElementCode]: entityName };
        }
        return acc;
      }, {});

      return { ...event, dataValues: { ...event.dataValues, ...updatedDataValues } };
    }),
  );
};
