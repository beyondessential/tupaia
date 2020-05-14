/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import flatten from 'lodash.flatten';

import { dateStringToPeriod } from '@tupaia/dhis-api';
import { buildEventsFromDhisEventAnalytics } from './buildEventsFromDhisEventAnalytics';

export const buildAnalyticsFromDhisEventAnalytics = (dhisEventAnalytics, dataElementCodes = []) => {
  const events = buildEventsFromDhisEventAnalytics(dhisEventAnalytics, dataElementCodes);

  return {
    results: eventsToAnalytics(events),
    metadata: buildMetadata(dhisEventAnalytics, dataElementCodes),
  };
};

const eventsToAnalytics = events =>
  flatten(
    events.map(({ eventDate, orgUnit, dataValues }) =>
      Object.entries(dataValues).map(([dataElement, value]) => ({
        period: dateStringToPeriod(eventDate),
        organisationUnit: orgUnit,
        dataElement,
        value,
      })),
    ),
  );

const buildMetadata = (dhisEventAnalytics, dataElementCodes) => {
  const { items: dimensionCodeToName } = dhisEventAnalytics.metaData;

  const dataElementCodeToName = {};
  Object.entries(dimensionCodeToName).forEach(([code, { name }]) => {
    if (dataElementCodes.includes(code)) {
      dataElementCodeToName[code] = name;
    }
  });

  return { dataElementCodeToName };
};
