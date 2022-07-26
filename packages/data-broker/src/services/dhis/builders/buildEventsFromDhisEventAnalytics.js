/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getSortByKey } from '@tupaia/utils';
import { sanitizeValue } from './sanitizeValue';

/*
 * @typedef {{ event, orgUnit, orgUnitName, eventDate, dataValues: Object }} Event
 */

const METADATA_DIMENSION_TRANSLATION = {
  psi: 'event',
  oucode: 'orgUnit',
  ouname: 'orgUnitName',
  eventdate: 'eventDate',
};

const createDimensionTranslator = dataElementCodes => dimension => {
  const metadataDimension = METADATA_DIMENSION_TRANSLATION[dimension];
  if (metadataDimension) {
    return metadataDimension;
  }

  // Unfortunately there is no 100% accurate way to tell if a dimension is a data element
  // just from the DHIS2 response, thus we must get this information via `dataElementCodes`
  return dataElementCodes.includes(dimension) ? dimension : '';
};

export const buildEventsFromDhisEventAnalytics = (dhisEventAnalytics, dataElementCodes = []) => {
  const { headers, rows } = dhisEventAnalytics;
  const columnSpecs = getColumnSpecs(headers, dataElementCodes);

  const events = [];
  rows.forEach(row => {
    const event = { dataValues: {} };
    row.forEach((value, columnIndex) => {
      const { dimension, valueType } = columnSpecs[columnIndex];
      if (!dimension) {
        return;
      }

      const formattedValue = sanitizeValue(value, valueType);
      if (dataElementCodes.includes(dimension)) {
        event.dataValues[dimension] = formattedValue;
      } else {
        event[dimension] = formattedValue;
      }
    });

    events.push(event);
  });

  return events.sort(getSortByKey(METADATA_DIMENSION_TRANSLATION.eventdate));
};

const getColumnSpecs = (headers, dataElementCodes) => {
  const columnSpecs = new Array(headers.length).fill({});
  const translateDimension = createDimensionTranslator(dataElementCodes);

  headers.forEach(({ name: dimension, valueType }, columnIndex) => {
    const translatedDimension = translateDimension(dimension);
    if (translatedDimension) {
      columnSpecs[columnIndex] = { dimension: translatedDimension, valueType };
    }
  });

  return columnSpecs;
};
