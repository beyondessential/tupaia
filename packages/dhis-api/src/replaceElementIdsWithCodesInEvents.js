/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DHIS2_RESOURCE_TYPES } from '../dist';

export const replaceElementIdsWithCodesInEvents = async (dhisApi, events) => {
  const ids = events.reduce(
    (allIds, event) => allIds.concat(event.dataValues.map(({ dataElement }) => dataElement)),
    [],
  );
  const dataElementsById = await dhisApi.getRecords({
    ids,
    fields: ['id,code'],
    type: DHIS2_RESOURCE_TYPES.DATA_ELEMENT,
  });

  return events.map(({ dataValues, ...restOfEvent }) => ({
    ...restOfEvent,
    dataValues: dataValues.map(value => ({
      ...value,
      dataElement: dataElementsById[value.dataElement].code,
    })),
  }));
};
