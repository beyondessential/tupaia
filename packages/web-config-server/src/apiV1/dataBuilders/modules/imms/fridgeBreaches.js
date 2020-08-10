/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

import { FRIDGE_BREACH_AGR_ELEMENT_CODES } from '/preaggregation/preaggregators/immsFridgeBreaches';
import { tableOfEvents } from '/apiV1/dataBuilders/generic/table/tableOfEvents';

const { BREACH_TEMP, BREACH_SOH_VALUE, BREACH_MINS } = FRIDGE_BREACH_AGR_ELEMENT_CODES;

/**
 * @param {Object} queryConfig
 * @param {DhisApi} dhisApi
 * @returns {Promise<{ rows: Array<Object<string, string>, columns: Array<{ key, title }> }}
 */
export const fridgeBreaches = async (queryConfig, aggregator, dhisApi) => {
  const eventTable = await tableOfEvents(queryConfig, aggregator, dhisApi);
  const { entity } = queryConfig;

  const columns = [
    { key: 'temperature', title: 'Breach Temperature' },
    { key: 'duration', title: 'Duration' },
    { key: 'sohValue', title: 'Value of SOH' },
  ];

  const categories = {};
  const rows = eventTable.rows.map(row => {
    const {
      dataElement: eventDate,
      organisationUnitName,
      [BREACH_TEMP]: temperature,
      [BREACH_MINS]: durationInMinutes,
      [BREACH_SOH_VALUE]: sohValue,
    } = row;

    categories[organisationUnitName] = {
      category: organisationUnitName,
    };
    const resultRow = {
      dataElement: eventDate,
      categoryId: organisationUnitName,
      temperature: temperature,
      duration: getBreachDurationString(parseFloat(durationInMinutes)),
      sohValue: `$${sohValue}`,
    };

    return resultRow;
  });

  if (entity.isFacility()) {
    return {
      rows: rows.map(({ categoryId, ...r }) => r), // remove categoryId if not grouping by facility
      columns,
    };
  }
  return { rows: [...rows, ...Object.values(categories)], columns };
};

/**
 * @param {number} durationInMinutes
 * @returns {string}
 */
const getBreachDurationString = durationInMinutes => {
  // Keep 1 decimal
  const formatDuration = inputDuration => Math.round(inputDuration * 10) / 10;

  const durationMoment = moment.duration(durationInMinutes, 'minutes');
  const minutesPerDay = 60 * 24;
  const minutesPerHour = 60;

  if (durationInMinutes >= minutesPerDay) {
    return `${formatDuration(durationMoment.asDays())} days`;
  }
  if (durationInMinutes >= minutesPerHour) {
    return `${formatDuration(durationMoment.asHours())} hours`;
  }
  return `${formatDuration(durationInMinutes)} minutes`;
};
