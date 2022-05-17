/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getSortByKey } from '@tupaia/utils';
import { Analytic, Event, RequireKeys } from '../../../types';
import { DhisEventAnalytics, ValueType } from '../types';
import { sanitizeValue } from './sanitizeValue';

const METADATA_DIMENSION_TRANSLATION = {
  psi: 'event',
  oucode: 'orgUnit',
  ouname: 'orgUnitName',
  eventdate: 'eventDate',
};

type ColumnSpec = {
  dimension: keyof Analytic;
  valueType: ValueType;
};

type MetadataDimension = keyof typeof METADATA_DIMENSION_TRANSLATION;

type EventMetadataKey = Exclude<keyof Event, 'dataValues'>;

const createDimensionTranslator = (dataElementCodes: string[]) => (dimension: string) => {
  const metadataDimension = METADATA_DIMENSION_TRANSLATION[dimension as MetadataDimension];
  if (metadataDimension) {
    return metadataDimension;
  }

  // Unfortunately there is no 100% accurate way to tell if a dimension is a data element
  // just from the DHIS2 response, thus we must get this information via `dataElementCodes`
  return dataElementCodes.includes(dimension) ? dimension : '';
};

export const buildEventsFromDhisEventAnalytics = (
  dhisEventAnalytics: DhisEventAnalytics,
  dataElementCodes: string[] = [],
): Event[] => {
  const { headers, rows } = dhisEventAnalytics;
  const columnSpecs = getColumnSpecs(headers, dataElementCodes);

  const events: Event[] = [];
  rows.forEach(row => {
    const event: RequireKeys<Partial<Event>, 'dataValues'> = { dataValues: {} };
    row.forEach((value, columnIndex) => {
      const { dimension, valueType } = columnSpecs[columnIndex];
      if (!dimension) {
        return;
      }

      const formattedValue = sanitizeValue(value, valueType as ValueType);
      if (dataElementCodes.includes(dimension)) {
        event.dataValues[dimension] = formattedValue;
      } else {
        event[dimension as EventMetadataKey] = formattedValue as string;
      }
    });

    events.push(event as Event);
  });

  return events.sort(getSortByKey(METADATA_DIMENSION_TRANSLATION.eventdate as string));
};

const getColumnSpecs = (
  headers: DhisEventAnalytics['headers'],
  dataElementCodes: string[],
): Partial<ColumnSpec>[] => {
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
