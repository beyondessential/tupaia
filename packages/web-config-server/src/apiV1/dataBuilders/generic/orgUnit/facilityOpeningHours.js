/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { addRow } from './addRow';

const SORTED_WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const facilityOpeningHours = async ({ dataBuilderConfig, query }, aggregator) => {
  const { dataElementCodes: rawDataElementCodes, dataServices } = dataBuilderConfig;
  const dataElementCodes = Object.values(rawDataElementCodes).flat();
  const { results } = await aggregator.fetchAnalytics(dataElementCodes, { dataServices }, query);
  const resultsCodeToValue = Object.fromEntries(results.map(row => [[row.dataElement], row.value]));

  const openingHours = {};
  Object.entries(rawDataElementCodes).forEach(([day, codes]) => {
    // If it is open this day 'codes[0]', and has opening time 'codes[1]' and closing time 'codes[2]'
    if (
      codes[0] &&
      resultsCodeToValue[codes[0]] === 'Yes' &&
      codes[1] &&
      resultsCodeToValue[codes[1]] &&
      codes[2] &&
      resultsCodeToValue[codes[2]]
    ) {
      openingHours[day] = `${resultsCodeToValue(codes[1])} - ${resultsCodeToValue(codes[2])}`;
    } else openingHours[day] = 'Closed';
  });

  const returnData = SORTED_WEEKDAYS.map(day => addRow(openingHours[day], day));
  return { data: returnData };
};
