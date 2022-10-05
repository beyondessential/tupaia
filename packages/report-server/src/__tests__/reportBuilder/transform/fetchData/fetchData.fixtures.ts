/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import {
  EARLIEST_DATA_DATE_STRING,
  getPeriodsInRange,
  periodToMoment,
  utcMoment,
} from '@tupaia/utils';

export const HIERARCHY = 'explore';

export const ENTITIES = {
  explore: [
    { code: 'explore', country_code: null, type: 'project' },
    { code: 'TO', country_code: 'TO', type: 'country' },
    { code: 'WS', country_code: 'WS', type: 'country' },
    { code: 'KI', country_code: 'KI', type: 'country' },
    { code: 'MY', country_code: 'MY', type: 'country' },
    { code: 'PG', country_code: 'PG', type: 'country' },
    { code: 'PG_District', country_code: 'PG', type: 'district' },
    { code: 'PG_Facility', country_code: 'PG', type: 'facility' },
  ],
  underwater_world: [
    { code: 'underwater_world', country_code: null, type: 'project' },
    { code: 'AQUA_LAND', country_code: 'AQUA_LAND', type: 'country' },
  ],
};

export const RELATIONS = {
  explore: [
    { parent: 'explore', child: 'TO' },
    { parent: 'explore', child: 'WS' },
    { parent: 'explore', child: 'KI' },
    { parent: 'explore', child: 'MY' },
    { parent: 'explore', child: 'PG' },
    { parent: 'PG', child: 'PG_District' },
    { parent: 'PG_District', child: 'PG_Facility' },
  ],
  underwater_world: [{ parent: 'underwater_world', child: 'AQUA_LAND' }],
};

export const CURRENT_DATE_STUB = '2020-12-15T00:00:00Z';

const SURVEY_QUESTIONS = {
  BCD: ['BCD1', 'BCD2'],
  ABC: ['ABC1', 'ABC2'],
};

const generateFakeAnalytics = () => {
  const periods = getPeriodsInRange(EARLIEST_DATA_DATE_STRING, CURRENT_DATE_STUB, 'DAY');
  const organisationUnits = Object.values(ENTITIES)
    .flat()
    .map(({ code }) => code);
  const dataElements = Object.values(SURVEY_QUESTIONS).flat();
  let count = 0;
  const fakeAnalytics: {
    period: string;
    organisationUnit: string;
    dataElement: string;
    value: number;
  }[] = [];
  periods.forEach(period =>
    organisationUnits.forEach(organisationUnit =>
      dataElements.forEach(dataElement => {
        // Only add each 234th analytic, to cut down on the record size to make error messages more helpful
        if (count % 234 === 0) {
          fakeAnalytics.push({ period, organisationUnit, dataElement, value: count });
        }

        count++;
      }),
    ),
  );
  return fakeAnalytics;
};

const ANALYTICS = generateFakeAnalytics();

const EVENTS: Record<
  string,
  { orgUnit: string; eventDate: string; dataValues: Record<string, unknown> }[]
> = {
  BCD: [{ orgUnit: 'TO', eventDate: '2020-01-01', dataValues: { BCD1: 7, BCD2: 8 } }],
  ABC: [{ orgUnit: 'TO', eventDate: '2020-01-01', dataValues: { ABC1: 7, ABC2: 8 } }],
};

export const fetchFakeAnalytics = (
  dataElementCodes: string[],
  aggregationList: undefined,
  organisationUnitCodes: string[],
  hierarchy: undefined,
  { startDate, endDate }: { startDate: string; endDate: string },
) => {
  return {
    results: ANALYTICS.filter(
      analytic =>
        dataElementCodes.includes(analytic.dataElement) &&
        organisationUnitCodes.includes(analytic.organisationUnit) &&
        periodToMoment(analytic.period) >= utcMoment(startDate) &&
        periodToMoment(analytic.period) <= utcMoment(endDate),
    ),
  };
};

export const getFetchAnalyticsResults = (
  dataElementCodes: string[],
  organisationUnitCodes: string[],
  startDate: string,
  endDate: string,
) => {
  return fetchFakeAnalytics(dataElementCodes, undefined, organisationUnitCodes, undefined, {
    startDate,
    endDate,
  }).results;
};

export const fetchFakeEvents = (
  dataGroupCode: string,
  aggregationList: undefined,
  organisationUnitCodes: string[],
  hierarchy: undefined,
  { startDate, endDate }: { startDate: string; endDate: string },
  dataElementCodes: string[],
) => {
  const eventsForDataGroup = EVENTS[dataGroupCode];
  const eventsMatchingFilters = eventsForDataGroup.filter(
    event =>
      organisationUnitCodes.includes(event.orgUnit) &&
      event.eventDate >= startDate &&
      event.eventDate <= endDate,
  );
  const eventsWithRequestedDataElements = eventsMatchingFilters.map(
    ({ dataValues, ...restOfEvent }) => ({
      ...restOfEvent,
      dataValues: Object.fromEntries(
        Object.entries(dataValues).filter(([dataElement]) =>
          dataElementCodes.includes(dataElement),
        ),
      ),
    }),
  );
  return eventsWithRequestedDataElements;
};

export const getFetchEventsResults = (
  dataGroupCode: string,
  dataElementCodes: string[],
  organisationUnitCodes: string[],
  startDate: string,
  endDate: string,
) => {
  const events = fetchFakeEvents(
    dataGroupCode,
    undefined,
    organisationUnitCodes,
    undefined,
    { startDate, endDate },
    dataElementCodes,
  );

  return events.map(({ dataValues, ...restOfEvent }) => ({ ...dataValues, ...restOfEvent }));
};
