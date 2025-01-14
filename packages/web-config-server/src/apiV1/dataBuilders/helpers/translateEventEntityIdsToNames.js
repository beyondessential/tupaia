import { transformValue } from 'apiV1/dataBuilders/transform';

export const translateEventEntityIdsToNames = async (models, events, dataElementCodes) => {
  return Promise.all(
    events.map(async event => {
      const updatedDataValues = {};
      await Promise.all(
        dataElementCodes.map(async dataElementCode => {
          const dataValueEntityId = event.dataValues[dataElementCode];
          if (dataValueEntityId) {
            const entityName = await transformValue(models, 'entityIdToName', dataValueEntityId);
            updatedDataValues[dataElementCode] = entityName;
          }
        }),
      );
      return { ...event, dataValues: { ...event.dataValues, ...updatedDataValues } };
    }),
  );
};
