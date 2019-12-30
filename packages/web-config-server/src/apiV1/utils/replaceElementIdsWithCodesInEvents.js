/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

export const replaceElementIdsWithCodesInEvents = async (dhisApi, events) => {
  const programStageIdSet = new Set(events.map(({ programStage }) => programStage));
  const programStages = await dhisApi.getRecords({
    type: 'programStages',
    ids: Array.from(programStageIdSet),
    fields: ['programStageDataElements[dataElement[id,code]]'],
  });

  const dataElementIdToCode = {};
  programStages.forEach(({ programStageDataElements }) => {
    programStageDataElements.forEach(({ dataElement }) => {
      const { id, code } = dataElement;
      dataElementIdToCode[id] = code;
    });
  });

  const mapDataValues = dataValues =>
    dataValues.map(value => ({
      ...value,
      dataElement: dataElementIdToCode[value.dataElement],
    }));

  return events.map(event => ({
    ...event,
    dataValues: mapDataValues(event.dataValues),
  }));
};
