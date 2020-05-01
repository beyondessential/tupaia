/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { dateStringToPeriod } from '@tupaia/dhis-api';
import { getSortByKey } from '@tupaia/utils';
import { sanitizeValue } from './sanitizeValue';

/*
 * @typedef {{ eventId, organisationUnit, period, values: Object }} Event
 */

const METADATA_DIMENSION_TRANSLATION = {
  psi: 'eventId',
  oucode: 'organisationUnit',
  eventdate: 'period',
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
    const event = { values: {} };
    row.forEach((value, columnIndex) => {
      const { dimension, valueType } = columnSpecs[columnIndex];
      if (!dimension) {
        return;
      }

      const formattedValue = formatValue({ dimension, value, valueType });
      if (dataElementCodes.includes(dimension)) {
        event.values[dimension] = formattedValue;
      } else {
        event[dimension] = formattedValue;
      }
    });

    events.push(event);
  });

  return events.sort(getSortByKey('period'));
};

const formatValue = ({ dimension, value, valueType }) =>
  dimension === 'period' ? dateStringToPeriod(value) : sanitizeValue(value, valueType);

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
